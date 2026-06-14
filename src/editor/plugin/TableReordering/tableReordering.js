import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Fragment } from "@tiptap/pm/model";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { CellSelection } from "@tiptap/pm/tables";

import { getIsDragging, isInclusive } from "../../../utils";
import { getPosAtDOM, getTableMap } from "../../utils";

const getColumnSelection = (doc, grid, index) => {
  const anchorCell = grid[0][index];
  const headCell = grid[grid.length - 1][index];

  return CellSelection.create(doc, anchorCell.pos, headCell.pos);
};

const getColumnDimensions = (table, scrollLeft) => {
  const row = table.querySelector("tr");
  const cells = row.children;

  return Array.from(cells).map((cell) => {
    const rect = cell.getBoundingClientRect();

    return { start: rect.left + scrollLeft, end: rect.right + scrollLeft };
  });
};

const getRowSelection = (doc, grid, index) => {
  const targetRow = grid[index];
  const anchorCell = targetRow[0];
  const headCell = targetRow[targetRow.length - 1];

  return CellSelection.create(doc, anchorCell.pos, headCell.pos);
};

const getRowDimensions = (table) => {
  const rows = table.querySelectorAll("tr");

  return Array.from(rows).map((row) => {
    const rect = row.getBoundingClientRect();

    return {
      start: rect.top + window.scrollY,
      end: rect.bottom + window.scrollY,
    };
  });
};

const getToIndex = (dimensions, point, fromIndex) => {
  let toIndex = null;

  for (let i = 0; i < dimensions.length; i++) {
    const { start, end } = dimensions[i];

    if (isInclusive(point, start, end)) {
      if (fromIndex === i) {
        toIndex = null;
        break;
      } else {
        toIndex = i;
        break;
      }
    }
  }

  return toIndex;
};

const getTargetVectorClass = (vector, fromIndex, toIndex) => {
  if (toIndex === null) return null;

  if (vector === "column") {
    if (fromIndex > toIndex) {
      return "target-cell-left";
    }

    if (fromIndex < toIndex) {
      return "target-cell-right";
    }
  }

  if (vector === "row") {
    if (fromIndex > toIndex) {
      return "target-cell-top";
    }

    if (fromIndex < toIndex) {
      return "target-cell-bottom";
    }
  }
};

const getTargetColumnDecorations = (grid, fromIndex, toIndex) => {
  const targetClass = getTargetVectorClass("column", fromIndex, toIndex);

  return grid.map((row) => {
    const cell = row[toIndex];

    const dec = Decoration.node(cell.pos, cell.pos + cell.node.nodeSize, {
      class: targetClass,
    });

    return dec;
  });
};

const getTargetRowDecorations = (grid, fromIndex, toIndex) => {
  const targetClass = getTargetVectorClass("row", fromIndex, toIndex);

  return grid[toIndex].map((cell) => {
    const dec = Decoration.node(cell.pos, cell.pos + cell.node.nodeSize, {
      class: targetClass,
    });

    return dec;
  });
};

const tableReorderingKey = new PluginKey("tableReorderingKey");

const tableReordering = new Plugin({
  key: tableReorderingKey,

  state: {
    init() {
      return {
        selectedVectorDecs: null,
        targetedVectorDecs: null,
      };
    },

    apply(tr, value) {
      const selectedVector = tr.getMeta("selected-vector");
      const targetedVector = tr.getMeta("targeted-vector");

      const newValue = value;

      if (selectedVector) return { ...newValue, selectedVector };
      if (targetedVector) return { ...newValue, targetedVector };

      return value;
    },
  },

  props: {
    decorations(state) {
      const { selectedVector, targetedVector } =
        tableReorderingKey.getState(state);

      const arr = [];

      if (selectedVector) selectedVector.forEach((e) => arr.push(e));
      if (targetedVector) targetedVector.forEach((e) => arr.push(e));

      return DecorationSet.create(state.doc, arr);
    },
  },

  view(view) {
    let rafID = null;
    let moveEvent = null;

    let initCoords = null;

    let vector = null;
    let dimensions = null;

    let tableDOM = null;
    let wrapperDOM = null;

    let tableBefore = null;
    let tableNode = null;

    let tableGrid = null;
    let tableRows = null;

    let fromIndex = null;
    let toIndex = null;

    // todo: implement horizontal or vertical scrolling
    // todo: identify the appropriate container when vertical scrolling
    // in Note, it's the window, in Whiteboard, it'll be something else
    const loop = () => {
      const { tr } = view.state;
      const { dispatch } = view;

      const currCoords = {
        x: moveEvent.clientX,
        y: moveEvent.clientY,
      };

      const isDragging = getIsDragging(initCoords, currCoords, 5);

      // one time thing
      if (isDragging && !dimensions) {
        dimensions =
          vector === "column"
            ? getColumnDimensions(tableDOM, wrapperDOM.scrollLeft)
            : getRowDimensions(tableDOM);

        // todo: create ghost
        // todo: hollow out the selected vector
      }

      if (isDragging) {
        const mousePoint =
          vector === "column"
            ? moveEvent.clientX + wrapperDOM.scrollLeft
            : moveEvent.pageY;

        toIndex = getToIndex(dimensions, mousePoint, fromIndex);

        if (toIndex === null) {
          // fix: need to change the name and the approach
          tr.setMeta("targeted-vector", []);

          dispatch(tr);
        }

        if (toIndex !== null) {
          const decs =
            vector === "column"
              ? getTargetColumnDecorations(tableGrid, fromIndex, toIndex)
              : getTargetRowDecorations(tableGrid, fromIndex, toIndex);

          tr.setMeta("targeted-vector", decs);

          dispatch(tr);
        }
      }

      rafID = requestAnimationFrame(loop);
    };

    const down = (e) => {
      const tableButton = e.target.closest(".table-button");
      if (!tableButton) return;

      e.preventDefault();

      initCoords = { x: e.clientX, y: e.clientY };

      // I do need to check if it's a pure click
      // maybe I should add capture and set stopPropagation?

      const { tr } = view.state;
      const { dispatch } = view;

      vector = tableButton.dataset.buttonType;
      fromIndex = parseInt(tableButton.dataset.index);

      tableDOM = tableButton.closest(".block-table");
      wrapperDOM = tableDOM.querySelector(".tableWrapper");

      tableBefore = getPosAtDOM(view, tableDOM);
      tableNode = view.state.doc.nodeAt(tableBefore);

      const { grid, rows } = getTableMap(tableNode, tableBefore);
      tableGrid = grid;
      tableRows = rows;

      if (vector === "column") {
        const sel = getColumnSelection(tr.doc, grid, fromIndex);

        tr.setSelection(sel);

        dispatch(tr);
      }

      if (vector === "row") {
        const sel = getRowSelection(tr.doc, grid, fromIndex);

        tr.setSelection(sel);

        dispatch(tr);
      }

      const move = (e) => {
        moveEvent = e;

        if (!rafID) rafID = requestAnimationFrame(loop);
      };

      const up = () => {
        const { tr } = view.state;
        const { dispatch } = view;

        if (toIndex !== null) {
          const { tableRow, tableCell, tableHeader } = view.state.schema.nodes;
          const { isHeaderColumn, isHeaderRow } = tableNode.attrs;

          if (vector === "column" && fromIndex > toIndex) {
            const bothHeader = isHeaderColumn && isHeaderRow && toIndex === 0;
            const onlyColumn = isHeaderColumn && !isHeaderRow && toIndex === 0;

            tableGrid.forEach((row, i) => {
              const { pos: toPos, node: toNode } = row[toIndex];
              const { pos: fromPos, node: fromNode } = row[fromIndex];
              const convertedNode =
                bothHeader || onlyColumn
                  ? tableHeader.create(
                      fromNode.attrs,
                      fromNode.content,
                      fromNode.marks,
                    )
                  : fromNode;

              if (onlyColumn || (bothHeader && i !== 0)) {
                tr.setNodeMarkup(
                  tr.mapping.map(toPos),
                  tableCell,
                  toNode.attrs,
                );
              }

              const from = fromPos;
              const to = fromPos + fromNode.nodeSize;
              tr.delete(tr.mapping.map(from), tr.mapping.map(to));
              tr.insert(tr.mapping.map(toPos), convertedNode);
            });

            const anchorPos = tableGrid[0][toIndex].pos;
            const headPos = tableGrid[tableGrid.length - 1][toIndex].pos;
            const sel = CellSelection.create(tr.doc, anchorPos, headPos);

            tr.setSelection(sel);
          }

          if (vector === "column" && fromIndex < toIndex) {
            const bothHeader = isHeaderColumn && isHeaderRow && fromIndex === 0;
            const onlyColumn =
              isHeaderColumn && !isHeaderRow && fromIndex === 0;
            let anchorPos = null;
            let headPos = null;

            tableGrid.forEach((row, i) => {
              const { pos: fromPos, node: fromNode } = row[fromIndex];
              const { pos: plus1Pos, node: plus1Node } = row[fromIndex + 1];
              const { pos: toPos, node: toNode } = row[toIndex];

              const convertedNode =
                (bothHeader && i !== 0) || onlyColumn
                  ? tableCell.create(
                      fromNode.attrs,
                      fromNode.content,
                      fromNode.marks,
                    )
                  : fromNode;

              if (bothHeader || onlyColumn) {
                tr.setNodeMarkup(
                  tr.mapping.map(plus1Pos),
                  tableHeader,
                  plus1Node.attrs,
                );
              }

              const from = fromPos;
              const to = fromPos + fromNode.nodeSize;
              tr.delete(tr.mapping.map(from), tr.mapping.map(to));

              const mappedToPos = tr.mapping.map(toPos + toNode.nodeSize);
              tr.insert(mappedToPos, convertedNode);

              if (i === 0)
                anchorPos = toPos + toNode.nodeSize - convertedNode.nodeSize;
              if (i === tableGrid.length - 1)
                headPos = toPos + toNode.nodeSize - convertedNode.nodeSize;
            });

            const sel = CellSelection.create(tr.doc, anchorPos, headPos);

            tr.setSelection(sel);
          }

          if (vector === "row" && fromIndex > toIndex) {
            const bothHeader = isHeaderColumn && isHeaderRow && toIndex === 0;
            const onlyRow = !isHeaderColumn && isHeaderRow && toIndex === 0;

            // if it's bothHeader -> with the exception of the first cell, convert them to tableCell
            // if it's onlyRow -> convert all to cells
            if (bothHeader || onlyRow) {
              const toRow = tableGrid[toIndex];
              toRow.forEach(({ pos, node }, i) => {
                if (onlyRow || i !== 0) {
                  tr.setNodeMarkup(pos, tableCell, node.attrs);
                }
              });
            }

            let convertedRow = tableRows[fromIndex].node;

            // todo: make this a util function
            if (bothHeader || onlyRow) {
              // always convert this to header
              const fromRow = tableGrid[fromIndex];
              const content = fromRow.map(({ node }) => {
                return tableHeader.create(node.attrs, node.content, node.marks);
              });
              convertedRow = tableRow.create(
                tableRows[fromIndex].node.attrs,
                Fragment.from(content),
              );
            }

            const { pos, node } = tableRows[fromIndex];
            const fromBefore = pos;
            const fromAfter = pos + node.nodeSize;
            tr.delete(fromBefore, fromAfter);
            tr.insert(tableRows[toIndex].pos, convertedRow);
            // +1 from the row's before to get the first cell's before
            const anchorPos = tableRows[toIndex].pos + 1;
            // -1 from the row's after to get the last cell's after
            // subtract the last node's size to get the last cell's before
            const headPos =
              tableRows[toIndex].pos +
              convertedRow.nodeSize -
              convertedRow.lastChild.nodeSize -
              1;

            const sel = CellSelection.create(tr.doc, anchorPos, headPos);

            tr.setSelection(sel);
          }

          if (vector === "row" && fromIndex < toIndex) {
            const bothHeader = isHeaderColumn && isHeaderRow && fromIndex === 0;
            const onlyRow = !isHeaderColumn && isHeaderRow && fromIndex === 0;

            // always convert the next row from from row to convert all its cells to header
            if (bothHeader || onlyRow) {
              tableGrid[fromIndex + 1].forEach(({ pos, node }) => {
                tr.setNodeMarkup(pos, tableHeader, node.attrs);
              });
            }

            let convertedRow = tableRows[fromIndex].node;

            // if bothHeader -> convert all cells to table cells expect for the first one
            // if onlyRow -> convert all to cells
            if (bothHeader) {
              const content = tableGrid[fromIndex].map(({ node }, i) => {
                if (i === 0) return node;

                if (i !== 0)
                  return tableCell.create(node.attrs, node.content, node.marks);
              });

              convertedRow = tableRow.create(
                tableRows[fromIndex].node.attrs,
                Fragment.from(content),
              );
            }

            if (onlyRow) {
              const content = tableGrid[fromIndex].map(({ node }) => {
                return tableCell.create(node.attrs, node.content, node.marks);
              });

              convertedRow = tableRow.create(
                tableRows[fromIndex].node.attrs,
                Fragment.from(content),
              );
            }

            const insertPos =
              tableRows[toIndex].pos + tableRows[toIndex].node.nodeSize;
            tr.insert(insertPos, convertedRow);

            const from = tableRows[fromIndex].pos;
            const to =
              tableRows[fromIndex].pos + tableRows[fromIndex].node.nodeSize;
            tr.delete(from, to);

            const anchorPos = insertPos - (to - from) + 1;
            const headPos =
              anchorPos +
              convertedRow.nodeSize -
              convertedRow.lastChild.nodeSize -
              2;

            const sel = CellSelection.create(tr.doc, anchorPos, headPos);
            tr.setSelection(sel);
          }
        }

        if (rafID) {
          cancelAnimationFrame(rafID);
          rafID = null;
          moveEvent = null;
          initCoords = null;
          dimensions = null;
        }

        tr.setMeta("targeted-vector", []);
        dispatch(tr);

        document.removeEventListener("pointermove", move);
        document.removeEventListener("pointerup", up);
      };

      document.addEventListener("pointermove", move);
      document.addEventListener("pointerup", up);
    };

    view.root.addEventListener("pointerdown", down);

    return {
      destroy() {
        view.root.removeEventListener("pointerdown", down);
      },
    };
  },
});

export default tableReordering;
