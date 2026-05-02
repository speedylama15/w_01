import { Plugin } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { CellSelection } from "@tiptap/pm/tables";

import { getTableMap } from "../utils/getTableMap";

const TABLE_REORDER_HIDE_CELLS = "TABLE_REORDER_HIDE_CELLS";
const TABLE_REORDER_HOVERED_CELLS = "TABLE_REORDER_HOVERED_CELLS";

// todo
// [] prevent downward scrolling

const isClickOrDrag = (
  startCoords,
  currentCoords,
  threshold,
  xAccessor = (obj) => {
    return obj.x;
  },
  yAccessor = (obj) => {
    return obj.y;
  },
) => {
  const distance =
    Math.pow(Math.abs(xAccessor(currentCoords) - xAccessor(startCoords)), 2) +
    Math.pow(Math.abs(yAccessor(currentCoords) - yAccessor(startCoords)), 2);

  if (distance > Math.pow(threshold, 2)) return "DRAG";

  return "CLICK";
};

const getTableColumnDimensions = (containerRect, tableBlockDOM) => {
  const row = tableBlockDOM.querySelector("tr");
  const cells = Array.from(row.children);

  // fix: maybe I should -1 for index 1
  // fix: and +1 for last index?
  // idea: need to come up with a better idea
  // this is happening because of the border of tableWrapper. The border does not exist on certain cells
  return cells.map((cell, i) => {
    // th or td
    const left =
      i === 0
        ? containerRect.x + cell.offsetLeft - 1
        : containerRect.x + cell.offsetLeft;
    const right =
      i === cells.length - 1
        ? left + cell.offsetWidth + 1
        : left + cell.offsetWidth;

    return { left, right, index: cell.cellIndex };
  });
};

const getTableRowDimensions = (containerRect, tableBlockDOM) => {
  const rows = Array.from(tableBlockDOM.querySelectorAll("tr"));

  // fix: maybe I should -1 for index 1
  // fix: and +1 for last index?
  return rows.map((row) => {
    // tr
    const top = containerRect.y + row.offsetTop;
    const bottom = top + row.offsetHeight;

    return { top, bottom, index: row.rowIndex };
  });
};

const selectColumn = (tr, dispatch, tableMap, columnIndex) => {
  const firstRow = tableMap.grid[0];
  const lastRow = tableMap.grid[tableMap.grid.length - 1];

  const firstCell = firstRow[columnIndex];
  const lastCell = lastRow[columnIndex];

  const cellSelection = CellSelection.create(
    tr.doc,
    firstCell.pos,
    lastCell.pos,
  );

  tr.setSelection(cellSelection);

  dispatch(tr);
};

const selectRow = (tr, dispatch, tableMap, rowIndex) => {
  const row = tableMap.grid[rowIndex];

  const firstCell = row[0];
  const lastCell = row[row.length - 1];

  const cellSelection = CellSelection.create(
    tr.doc,
    firstCell.pos,
    lastCell.pos,
  );

  tr.setSelection(cellSelection);

  dispatch(tr);
};

const isInclusive = (value, from, to) => {
  return value >= from && value <= to;
};

export const TableReordering_Plugin = new Plugin({
  state: {
    init() {
      return {};
    },

    apply(tr, value) {
      const from = tr.getMeta("FROM");
      const to = tr.getMeta("TO");

      const copy = value;

      if (from) copy.from = from;
      if (to) copy.to = to;

      return copy;
    },
  },

  props: {
    decorations(state) {
      const obj = this.getState(state);

      // will be array
      const from = obj.from ? obj.from : [];
      const to = obj.to ? obj.to : [];

      return DecorationSet.create(state.doc, [...from, ...to]);
    },
  },

  view(view) {
    let mouseState = "IDLE";
    let operation = null;

    let tableBefore = null;
    let tableNode = null;
    let tableMap = null;
    let dimensions = null;

    let blockDOM = null;
    let containerDOM = null;
    let containerRect = null;

    let fromIndex = null;
    let toIndex = null;

    let startCoords = null;
    let currentCoords = null;

    let isColumn = null;

    let rafID = null;

    const onFrameReorderColumn = () => {
      if (rafID !== null) return; // already running

      const loop = () => {
        if (containerRect.right - currentCoords.x <= 5) {
          containerDOM.scrollBy(5, 0);
        } else if (currentCoords.x - containerRect.left <= 5) {
          containerDOM.scrollBy(-5, 0);
        }

        const mouseX = containerDOM.scrollLeft + currentCoords.x;

        let toData = null; // { left, right, index }

        const data = dimensions.find((d) =>
          isInclusive(mouseX, d.left, d.right),
        );

        if (!data) {
          if (currentCoords.x <= containerRect.left) toData = dimensions[0];
          if (currentCoords.x >= containerRect.right)
            toData = dimensions[dimensions.length - 1];
        } else {
          toData = data;
        }

        toIndex = toData.index;

        const { tr } = view.state;
        const { dispatch } = view;

        if (fromIndex === toIndex) {
          // reset
          tr.setMeta("TO", []);
          dispatch(tr);
        } else if (fromIndex > toIndex) {
          // find column
          // left
          const decorations = tableMap.grid.map((row) => {
            const { pos } = row[toIndex];

            return Decoration.widget(pos + 1, () => {
              const line = document.createElement("div");
              line.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 4px;
                    height: 100%;
                    background-color: #35d7ff;
                    pointer-events: none;
                `;

              return line;
            });
          });

          tr.setMeta("TO", decorations);

          dispatch(tr);
        } else {
          // find column
          // right
          const decorations = tableMap.grid.map((row) => {
            const { pos } = row[toIndex];

            return Decoration.widget(pos + 1, () => {
              const line = document.createElement("div");
              line.style.cssText = `
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 4px;
                    height: 100%;
                    background-color: #35d7ff;
                    pointer-events: none;
                `;

              return line;
            });
          });

          tr.setMeta("TO", decorations);

          dispatch(tr);
        }

        rafID = requestAnimationFrame(loop);
      };

      rafID = requestAnimationFrame(loop);
    };

    const down = (e) => {
      const { tr } = view.state;
      const { dispatch } = view;

      const tableButton = e.target.closest(".table-button");

      if (tableButton) {
        e.preventDefault();

        operation = "POTENTIAL_TABLE_REORDER";
        mouseState = "DOWN";

        startCoords = { x: e.clientX, y: e.clientY };
        currentCoords = { x: e.clientX, y: e.clientY };

        blockDOM = tableButton.closest(".block-table");
        containerDOM = blockDOM.querySelector(".tableWrapper");

        tableBefore = view.posAtDOM(blockDOM) - 1;
        tableNode = view.state.doc.nodeAt(tableBefore);

        tableMap = getTableMap(tableNode, tableBefore);

        fromIndex = parseInt(tableButton.getAttribute("data-index"));
        isColumn =
          tableButton.getAttribute("data-button-type") === "column"
            ? true
            : false;

        if (isColumn) selectColumn(tr, dispatch, tableMap, fromIndex);

        if (!isColumn) selectRow(tr, dispatch, tableMap, fromIndex);
      }
    };

    const move = (e) => {
      const { tr, selection } = view.state;
      const { dispatch } = view;

      currentCoords = { x: e.clientX, y: e.clientY };

      if (mouseState === "DOWN" && operation === "POTENTIAL_TABLE_REORDER") {
        const result = isClickOrDrag(startCoords, currentCoords, 25);

        // idea: this is a one and done
        if (result === "DRAG") {
          operation = "TABLE_REORDER";

          containerRect = containerDOM.getBoundingClientRect();

          // todo: create ghost

          const arr = [];
          selection.forEachCell((node, pos) => {
            const before = pos;
            const after = pos + node.nodeSize;

            const d = Decoration.node(before, after, { class: "from-cell" });

            arr.push(d);
          });
          tr.setMeta("FROM", arr);
          dispatch(tr);

          if (isColumn) {
            dimensions = getTableColumnDimensions(
              containerDOM.getBoundingClientRect(),
              blockDOM,
            );

            // todo: limit the range
            // not sure if I need to limit the range here or in the loop
          } else {
            dimensions = getTableRowDimensions(
              containerDOM.getBoundingClientRect(),
              blockDOM,
            );
          }

          return; // end the operation (to prevent mismatch tr/dispatch)
        }
      }

      if (operation === "TABLE_REORDER" && dimensions) {
        if (isColumn) {
          onFrameReorderColumn();
        }

        if (!isColumn) {
          // onFrameReorderRow();
        }
      }
    };

    const up = () => {
      const { tr } = view.state;
      const { dispatch } = view;

      // fix: conversion from cell <-> header
      if (operation === "TABLE_REORDER") {
        if (isColumn) {
          if (fromIndex > toIndex) {
            const cells = tableMap.grid.map((row) => row[fromIndex]);
            const insertPosArr = tableMap.grid.map((row) => row[toIndex].pos);

            // First insert (at original positions, mapped)
            insertPosArr.forEach((pos, i) => {
              const mappedPos = tr.mapping.map(pos);

              tr.insert(mappedPos, cells[i].node);
            });

            cells.forEach((cell) => {
              const mappedPos = tr.mapping.map(cell.pos);

              tr.delete(mappedPos, mappedPos + cell.node.nodeSize);
            });
          }

          if (fromIndex < toIndex) {
            const cells = tableMap.grid.map((row) => row[fromIndex]);
            const insertPosArr = tableMap.grid.map(
              (row) => row[toIndex].pos + row[toIndex].node.nodeSize,
            );

            insertPosArr.forEach((pos, i) => {
              const mappedPos = tr.mapping.map(pos);

              tr.insert(mappedPos, cells[i].node);
            });

            cells.forEach((cell) => {
              const mappedPos = tr.mapping.map(cell.pos);

              tr.delete(mappedPos, mappedPos + cell.node.nodeSize);
            });
          }

          const newTableNode = tr.doc.nodeAt(tableBefore);
          const newTableMap = getTableMap(newTableNode, tableBefore);
          const start = newTableMap.grid[0][toIndex].pos;
          const end =
            newTableMap.grid[newTableMap.grid.length - 1][toIndex].pos;

          tr.setSelection(CellSelection.create(tr.doc, start, end));
        }
      }

      if (rafID) {
        cancelAnimationFrame(rafID);
        rafID = null;
      }

      mouseState = "IDLE";
      operation = null;

      tableMap = null;
      dimensions = null;

      blockDOM = null;
      containerDOM = null;
      containerRect = null;

      fromIndex = null;

      startCoords = null;
      currentCoords = null;

      isColumn = null;

      tr.setMeta("FROM", []);
      tr.setMeta("TO", []);

      dispatch(tr);
    };

    view.root.addEventListener("mousedown", down);
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);

    return {
      destroy() {
        view.root.removeEventListener("mousedown", down);
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
      },
    };
  },
});

export default TableReordering_Plugin;
