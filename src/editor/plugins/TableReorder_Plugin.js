import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { CellSelection } from "@tiptap/pm/tables";

import { getDepthByContentType } from "../utils/depth/getDepthByContentType";

import { __pastedCells } from "@tiptap/pm/tables";

const TABLE_REORDER_HIDE_CELLS = "TABLE_REORDER_HIDE_CELLS";
const TABLE_REORDER_HOVERED_CELLS = "TABLE_REORDER_HOVERED_CELLS";

const getTableButtonAttributes = (tableButton) => {
  const { tableId } = tableButton.dataset;
  const isColumn = JSON.parse(tableButton.dataset.isColumn);
  const fromIndex = parseInt(tableButton.dataset.fromIndex);

  return { tableId, isColumn, fromIndex };
};

const getTableBlockDOMByID = (tableID) => {
  const tableBlockDOM = document.querySelector(
    `div[data-id="${tableID}"][data-content-type="table"]`,
  );

  return tableBlockDOM;
};

const getTableColumnDimension = (tableRect, tableBlockDOM) => {
  const row = tableBlockDOM.querySelector("tr");
  const cells = Array.from(row.children);

  return cells.map((cell) => {
    // th or td
    const start = tableRect.x + cell.offsetLeft;
    const end = start + cell.offsetWidth;

    return { start, end, index: cell.cellIndex };
  });
};

const getTableRowDimension = (tableRect, tableBlockDOM) => {
  const rows = Array.from(tableBlockDOM.querySelectorAll("tr"));

  return rows.map((row) => {
    // tr
    const start = tableRect.y + row.offsetTop;
    const end = start + row.offsetHeight;

    return { start, end, index: row.rowIndex };
  });
};

const getTableNode = ($from) => {
  const result = getDepthByContentType($from, "table");

  if (!result) return null;

  const { depth } = result;

  const before = $from.before(depth);
  const node = $from.node(depth);
  const after = before + node.nodeSize;

  return { before, after, node };
};

const getTableMap = (tableNode, tableBefore) => {
  const rowArray = [];
  const cellGrid = [];

  let rowIndex = null;

  tableNode.descendants((node, pos, parent, index) => {
    const nodePos = tableBefore + pos + 1;

    if (node.type.name === "tableRow") {
      const row = {
        node,
        pos: nodePos,
      };

      rowArray.push(row);

      rowIndex = index;
    }

    if (node.type.name === "tableHeader" || node.type.name === "tableCell") {
      const cell = {
        type: node.type.name === "tableHeader" ? "header" : "cell",
        node,
        pos: nodePos,
      };

      const row = cellGrid[rowIndex];

      if (!row) {
        cellGrid.push([cell]);
      } else {
        row.push(cell);
      }

      return false;
    }
  });

  return { rowArray, cellGrid };
};

const selectColumn = (doc, grid, index) => {
  const firstRow = grid[0];
  const lastRow = grid[grid.length - 1];

  const cellSelection = CellSelection.create(
    doc,
    firstRow[index].pos,
    lastRow[index].pos,
  );

  return cellSelection;
};

const selectRow = (doc, grid, index) => {
  const row = grid[index];

  const firstCell = row[0];
  const lastCell = row[row.length - 1];

  const cellSelection = CellSelection.create(doc, firstCell.pos, lastCell.pos);

  return cellSelection;
};

const getToIndex = (e, wrapperDOM, dimension, isColumn, fromIndex) => {
  let toIndex = null;

  dimension.forEach((cell) => {
    const { start, end, index } = cell;

    const mouseCoord = isColumn ? e.clientX + wrapperDOM.scrollLeft : e.clientY;

    const isValid =
      (mouseCoord >= start && mouseCoord <= end) ||
      (index === 0 && mouseCoord <= start) ||
      (index === dimension.length - 1 && mouseCoord >= end);

    if (isValid && index !== fromIndex) {
      toIndex = index;
    }
  });

  return toIndex;
};

const TableReorder_Key = new PluginKey("TableReorder_Key");

export const TableReorder_Plugin = new Plugin({
  key: TableReorder_Key,

  state: {
    init() {
      return {
        hiddenCellDecorations: [],
        hoveredCellDecorations: [],
      };
    },

    apply(tr, value) {
      const hiddenCells = tr.getMeta(TABLE_REORDER_HIDE_CELLS);
      const hoveredCells = tr.getMeta(TABLE_REORDER_HOVERED_CELLS);

      if (hiddenCells) {
        return { ...value, hiddenCellDecorations: hiddenCells };
      }

      if (hoveredCells) {
        return { ...value, hoveredCellDecorations: hoveredCells };
      }

      if (hiddenCells === null && hoveredCells === null) {
        return {
          ...value,
          hiddenCellDecorations: [],
          hoveredCellDecorations: [],
        };
      }

      if (hiddenCells === null) {
        return {
          ...value,
          hiddenCellDecorations: [],
        };
      }

      if (hoveredCells === null) {
        return {
          ...value,
          hoveredCellDecorations: [],
        };
      }

      return value;
    },
  },

  props: {
    decorations(state) {
      const { hiddenCellDecorations, hoveredCellDecorations } =
        this.getState(state);

      const decorations = [...hiddenCellDecorations, ...hoveredCellDecorations];

      if (decorations.length < 0) return DecorationSet.empty;

      return DecorationSet.create(state.doc, decorations);
    },

    handlePaste(view, e, slice) {
      if (!slice) return true;

      // console.log("slice", __pastedCells(slice));
      console.log("handlePaste", slice);

      const obj = {};

      let rowCount = -1;

      // slice.content.descendants((node, pos) => {
      //   if (node.type.name === "tableRow") {
      //     rowCount += 1;
      //     if (!obj[rowCount]) obj[rowCount] = [];
      //   }

      //   if (
      //     node.type.name === "tableCell" ||
      //     node.type.name === "tableHeader"
      //   ) {
      //     obj[rowCount].push({
      //       type: node.type.name,
      //       content: node.textContent,
      //     });

      //     return false;
      //   }
      // });

      return true;
    },

    // transformPasted(slice, view, plain) {
    //   //
    // },

    // transformPastedHTML(html, view) {
    //   console.log("transformPastedHTML", html);
    // },

    handleDOMEvents: {
      paste(view, e) {
        //
      },
    },
  },

  view(view) {
    const mouseState = {
      startCoords: null,
      isPressed: false,
      isDragging: false,
    };
    const tableData = { dimension: null, map: null, before: null };
    const wrapperData = { dom: null, rect: null };
    const handlerData = {
      clonedDOM: null,
      originalDOM: null,
      isColumn: null,
      fromIndex: null,
      toIndex: null,
    };

    const handleMouseDown = (e) => {
      const { selection, tr } = view.state;
      const { dispatch } = view;
      const { $from } = selection;

      if (e.button !== 0) return;

      // get the button
      const tableButton = e.target.closest(".table-button");

      if (!tableButton) return;

      e.preventDefault();

      // retrieve information from the button
      const { tableId, isColumn, fromIndex } =
        getTableButtonAttributes(tableButton);

      const tableBlockDOM = getTableBlockDOMByID(tableId);
      const tableWrapperDOM = tableBlockDOM.querySelector(".tableWrapper");
      // I need wrapper and NOT the block because the block has a padding
      const tableWrapperRect = tableWrapperDOM.getBoundingClientRect();

      // table MUST have a selection for table button to be pressed
      // that is why I can use $from to get the table node
      const { before, node } = getTableNode($from);

      const tableMap = getTableMap(node, before);

      if (isColumn) {
        const columnDimension = getTableColumnDimension(
          tableWrapperRect,
          tableBlockDOM,
        );

        tableData.dimension = columnDimension;

        const { cellGrid } = tableMap;
        dispatch(tr.setSelection(selectColumn(tr.doc, cellGrid, fromIndex)));
      }

      if (!isColumn) {
        const rowDimension = getTableRowDimension(
          tableWrapperRect,
          tableBlockDOM,
        );

        tableData.dimension = rowDimension;

        const { cellGrid } = tableMap;
        dispatch(tr.setSelection(selectRow(tr.doc, cellGrid, fromIndex)));
      }

      mouseState.isPressed = true;
      mouseState.startCoords = { x: e.clientX, y: e.clientY };
      tableData.before = before;
      tableData.map = tableMap;
      wrapperData.dom = tableWrapperDOM;
      wrapperData.rect = tableWrapperRect;
      handlerData.fromIndex = fromIndex;
      handlerData.isColumn = isColumn;
      handlerData.originalDOM = tableButton;
    };

    const handleMouseMove = (e) => {
      const { tr } = view.state;
      const { dispatch } = view;

      if (!mouseState.isPressed) return;

      const distance =
        Math.pow(e.clientX - mouseState.startCoords.x, 2) +
        Math.pow(e.clientY - mouseState.startCoords.y, 2);

      if (distance > 25) mouseState.isDragging = true;

      // only do something when isDragging is true
      if (!mouseState.isDragging) return;

      // if cloning has not been done...
      // then clone a handler
      // then hide the moving column/row
      // hide the table button as well
      if (!handlerData.clonedDOM) {
        handlerData.clonedDOM = handlerData.originalDOM.cloneNode(true);
        document.body.append(handlerData.clonedDOM);
        handlerData.clonedDOM.style.cssText = `
            display: flex;
            position: absolute;
            top: 0;
            left: 0;
            z-index: 10000;
        `;

        const decorations = [];
        view.state.selection.forEachCell((node, pos) => {
          const decoration = Decoration.node(pos, pos + node.nodeSize, {
            class: "table-reorder_hidden-cell",
          });

          decorations.push(decoration);
        });
        dispatch(tr.setMeta(TABLE_REORDER_HIDE_CELLS, decorations));

        handlerData.originalDOM.style.display = "none";
      }

      // handle movement of handler
      if (handlerData.isColumn) {
        const { x, y, width } = wrapperData.rect;

        const minX = x;
        const maxX = x + width;
        const clampedX = Math.max(minX, Math.min(e.clientX, maxX));

        handlerData.clonedDOM.style.top = `${y + window.scrollY}px`;
        handlerData.clonedDOM.style.left = `${clampedX}px`;

        // fix: will need to add auto scrolling here
      }

      if (!handlerData.isColumn) {
        const { x, y, height } = wrapperData.rect;

        const minY = y;
        const maxY = y + height;
        const clampedY = Math.max(minY, Math.min(e.clientY, maxY));

        handlerData.clonedDOM.style.top = `${clampedY + window.scrollY}px`;
        handlerData.clonedDOM.style.left = `${x - 1}px`;
      }
      // handle movement of handler

      // could be null or an int
      const toIndex = getToIndex(
        e,
        wrapperData.dom,
        tableData.dimension,
        handlerData.isColumn,
        handlerData.fromIndex,
      );

      handlerData.toIndex = toIndex;

      // review: from here
      let decorations = [];

      if (toIndex === null) {
        dispatch(tr.setMeta(TABLE_REORDER_HOVERED_CELLS, null));

        return;
      }

      if (
        handlerData.isColumn &&
        toIndex !== null &&
        handlerData.fromIndex !== toIndex
      ) {
        tableData.map.cellGrid.forEach((row) => {
          const cell = row[toIndex];

          const from = cell.pos;
          const to = cell.pos + cell.node.nodeSize;

          const name =
            handlerData.fromIndex < toIndex
              ? "hovered-cell_right"
              : "hovered-cell_left";

          const decoration = Decoration.node(from, to, {
            class: name,
          });

          decorations.push(decoration);
        });

        dispatch(tr.setMeta(TABLE_REORDER_HOVERED_CELLS, decorations));

        return;
      }

      if (
        !handlerData.isColumn &&
        toIndex !== null &&
        handlerData.fromIndex !== toIndex
      ) {
        const row = tableData.map.cellGrid[toIndex];

        row.forEach((cell) => {
          const from = cell.pos;
          const to = cell.pos + cell.node.nodeSize;

          const className =
            handlerData.fromIndex < toIndex
              ? "hovered-cell_below"
              : "hovered-cell_above";

          const decoration = Decoration.node(from, to, {
            class: className,
          });

          decorations.push(decoration);
        });

        dispatch(tr.setMeta(TABLE_REORDER_HOVERED_CELLS, decorations));

        return;
      }
    };

    const handleMouseUp = () => {
      const { tr } = view.state;
      const { dispatch } = view;

      const { isColumn, fromIndex, toIndex } = handlerData;

      if (toIndex === null) {
        // reset
        mouseState.startCoords = null;
        mouseState.isPressed = false;
        mouseState.isDragging = false;

        tableData.dimension = null;
        tableData.map = null;

        wrapperData.dom = null;
        wrapperData.rect = null;

        handlerData.clonedDOM = null;
        handlerData.originalDOM = null;
        handlerData.isColumn = null;
        handlerData.fromIndex = null;
        handlerData.toIndex = null;

        return;
      }

      const { map: oldMap } = tableData;

      // reorder
      if (isColumn) {
        oldMap.cellGrid.forEach((row) => {
          const fromCell = row[fromIndex];
          const toCell = row[toIndex];
          const toAfter = toCell.pos + toCell.node.nodeSize;

          if (fromIndex < toIndex) {
            tr.insert(toAfter, fromCell.node);
            tr.delete(fromCell.pos, fromCell.pos + fromCell.node.nodeSize);
          }

          if (fromIndex > toIndex) {
            tr.delete(fromCell.pos, fromCell.pos + fromCell.node.nodeSize);
            tr.insert(toCell.pos, fromCell.node);
          }
        });
      }

      if (!isColumn) {
        const fromRow = oldMap.rowArray[fromIndex];
        const toRow = oldMap.rowArray[toIndex];

        if (fromIndex < toIndex) {
          tr.insert(toRow.pos + toRow.node.nodeSize, fromRow.node);
          tr.delete(fromRow.pos, fromRow.pos + fromRow.node.nodeSize);
        }

        if (fromIndex > toIndex) {
          tr.delete(fromRow.pos, fromRow.pos + fromRow.node.nodeSize);
          tr.insert(toRow.pos, fromRow.node);
        }
      }
      // reorder

      const tableNode = tr.doc.nodeAt(tableData.before);

      const newMap = getTableMap(tableNode, tableData.before);

      // fix: arrange header and cell (did this only for ROW...)
      if (!isColumn) {
        if (fromIndex === 0) {
          const headerNode = oldMap.cellGrid[0][0]?.node;

          if (headerNode.type.name === "tableHeader") {
            // set this to header
            const fromRow = newMap.cellGrid[fromIndex];
            fromRow.forEach((cell) =>
              tr.setNodeMarkup(cell.pos, view.state.schema.nodes.tableHeader),
            );

            // set this to cell
            const toRow = newMap.cellGrid[toIndex];
            toRow.forEach((cell) =>
              tr.setNodeMarkup(cell.pos, view.state.schema.nodes.tableCell),
            );
          }
        }

        if (toIndex === 0) {
          const headerNode = oldMap.cellGrid[0][0]?.node;

          if (headerNode.type.name === "tableHeader") {
            const toRow = newMap.cellGrid[toIndex];
            toRow.forEach((cell) =>
              tr.setNodeMarkup(cell.pos, view.state.schema.nodes.tableHeader),
            );

            const nextRow = newMap.cellGrid[toIndex + 1];
            nextRow.forEach((cell) =>
              tr.setNodeMarkup(cell.pos, view.state.schema.nodes.tableCell),
            );
          }
        }
      }

      // set CellSelection
      if (isColumn) {
        tr.setSelection(selectColumn(tr.doc, newMap.cellGrid, toIndex));
      }

      if (!isColumn) {
        tr.setSelection(selectRow(tr.doc, newMap.cellGrid, toIndex));
      }

      tr.setMeta(TABLE_REORDER_HIDE_CELLS, null).setMeta(
        TABLE_REORDER_HOVERED_CELLS,
        null,
      );

      dispatch(tr);

      // reset
      mouseState.startCoords = null;
      mouseState.isPressed = false;
      mouseState.isDragging = false;

      tableData.dimension = null;
      tableData.map = null;

      wrapperData.dom = null;
      wrapperData.rect = null;

      handlerData.clonedDOM?.remove();
      handlerData.clonedDOM = null;
      handlerData.originalDOM = null;
      handlerData.isColumn = null;
      handlerData.fromIndex = null;
      handlerData.toIndex = null;
    };

    view.root.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return {
      destroy() {
        view.root.removeEventListener("mousedown", handleMouseDown);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      },
    };
  },
});
