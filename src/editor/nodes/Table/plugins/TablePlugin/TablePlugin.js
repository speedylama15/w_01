import { Plugin, PluginKey } from "@tiptap/pm/state";
import { getDepthByContent } from "../../../../utils/getDepthByContent";
import { CellSelection } from "@tiptap/pm/tables";
import { getColumnDimensions } from "../CellButton/utils/getColumnDimensions";
import { getRowDimensions } from "../CellButton/utils/getRowDimensions";
import { getTableBlockDOM } from "../SelectingCell/utils/getTableBlockDOM";

const moveElement = (arr, fromIndex, toIndex) => {
  if (
    fromIndex < 0 ||
    fromIndex >= arr.length ||
    toIndex < 0 ||
    toIndex >= arr.length
  ) {
    console.error("Indices are out of bounds.");

    return arr;
  }

  const element = arr.splice(fromIndex, 1)[0];

  arr.splice(toIndex, 0, element);

  return arr;
};

const getTableMap = (tableNode, tableBefore, tableAfter) => {
  const rowArray = [];
  const cellGrid = [];

  let rowIndex = null;

  tableNode.descendants((node, pos, parent, index) => {
    const nodePos = tableBefore + pos + 1;

    if (node.type.name === "tableRow") {
      const row = {
        tableBefore, // fix: needed?
        tableAfter, // fix: needed?
        tableNode, // fix: needed?
        node,
        pos: nodePos,
      };

      rowArray.push(row);

      rowIndex = index;
    }

    if (node.type.name === "tableHeader" || node.type.name === "tableCell") {
      const cell = {
        type: node.type.name === "tableHeader" ? "header" : "cell",
        tableBefore, // fix: needed?
        tableAfter, // fix: needed?
        tableNode, // fix: needed?
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

const selectColumn = (view, cellGrid, fromIndex) => {
  const { tr } = view.state;
  const { dispatch } = view;

  const firstRow = cellGrid[0];
  const lastRow = cellGrid[cellGrid.length - 1];

  const cellSelection = CellSelection.create(
    view.state.doc,
    firstRow[fromIndex].pos,
    lastRow[fromIndex].pos
  );

  tr.setSelection(cellSelection);

  dispatch(tr);
};

const selectRow = (view, cellGrid, fromIndex) => {
  const { tr } = view.state;
  const { dispatch } = view;

  const row = cellGrid[fromIndex];
  const firstCell = row[0];
  const lastCell = row[row.length - 1];

  const cellSelection = CellSelection.create(
    view.state.doc,
    firstCell.pos,
    lastCell.pos
  );

  tr.setSelection(cellSelection);

  dispatch(tr);
};

const getColumnReorderHandler = () => {
  const div = document.createElement("div");
  const button = document.createElement("button");

  div.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    display: flex;
    transform: translate(-50%, -50%);
  `;

  button.style.cssText = `
    background-color: rgb(255, 255, 255);
    width: 32px;
    height: 16px;
    border: 1px solid rgb(0, 0, 0);
    border-radius: 3px;
  `;

  document.body.append(div);
  div.append(button);

  return div;
};

const getRowReorderHandler = () => {
  const div = document.createElement("div");
  const button = document.createElement("button");

  div.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    display: flex;
    transform: translate(-50%, -50%);
  `;

  button.style.cssText = `
    background-color: rgb(255, 255, 255);
    width: 16px;
    height: 32px;
    border: 1px solid rgb(0, 0, 0);
    border-radius: 3px;
  `;

  document.body.append(div);
  div.append(button);

  return div;
};

const getToIndex = (
  e,
  tableDimensions,
  isColumn,
  tableWrapperDOM,
  fromIndex
) => {
  let toIndex = null;

  tableDimensions.forEach((cell) => {
    const { startPoint, endPoint, index } = cell;

    const mouseCoord = isColumn
      ? e.clientX + tableWrapperDOM.scrollLeft
      : e.clientY;

    const isValid =
      (mouseCoord >= startPoint && mouseCoord <= endPoint) ||
      (index === 0 && mouseCoord <= startPoint) ||
      (index === tableDimensions.length - 1 && mouseCoord >= endPoint);

    if (isValid && index !== fromIndex) {
      toIndex = index;
    }
  });

  return toIndex;
};

const TablePluginKey = new PluginKey("TablePluginKey");

export const TablePlugin = new Plugin({
  key: TablePluginKey,

  props: {
    handleTripleClick(view, pos, e) {
      const cell = e.target.closest("td, th");
      const tableButton = e.target.closest(".table-button");

      if (tableButton || cell) {
        e.preventDefault();
        e.stopPropagation();

        return true;
      }
    },
  },

  view(view) {
    let tableID = null;
    let rowArray = []; // []
    let cellGrid = []; // [][]

    const tableButtonState = {
      isPressed: false,
      isDragging: false,
      startCoords: null,
      fromIndex: null,
      toIndex: null,
      isColumn: null,
      tableID: null,
      tableBlockDOM: null,
      tableWrapperDOM: null,
      tableDimensions: null,
      reorderHandlerDOM: null,
      tableButtonDOM: null,
    };

    // todo: reminder, isColumn is a string "true" or "false"
    const handleMouseDown = (e) => {
      const { selection, tr } = view.state;
      const { dispatch } = view;
      const { $from } = selection;

      if (e.button !== 0) return;

      const tableButton = e.target.closest(".table-button");

      if (!tableButton) return;

      // fix: do I need tableID?
      const { tableId } = tableButton.dataset;
      const isColumn = JSON.parse(tableButton.dataset.isColumn);
      const fromIndex = parseInt(tableButton.dataset.fromIndex);

      const tableBlockDOM = getTableBlockDOM(tableId); // todo: need this for dimension calculation
      const tableWrapperDOM = tableBlockDOM.querySelector(".tableWrapper");
      const tableWrapperRect = tableWrapperDOM.getBoundingClientRect(); // todo: I need the wrapper's rect because the block has padding

      // idea: set values
      tableButtonState.isPressed = true;
      tableButtonState.startCoords = { x: e.clientX, y: e.clientY };
      tableButtonState.fromIndex = fromIndex;
      tableButtonState.isColumn = isColumn;
      tableButtonState.tableBlockDOM = tableBlockDOM;
      tableButtonState.tableWrapperDOM = tableWrapperDOM;
      tableButtonState.tableButtonDOM = tableButton;
      tableButtonState.tableID = tableId;

      const tableDepth = getDepthByContent($from, "table");
      const tableBefore = $from.before(tableDepth);
      const tableNode = $from.node(tableDepth);
      const tableAfter = tableBefore + tableNode.nodeSize;

      const map = getTableMap(tableNode, tableBefore, tableAfter);

      // idea: set values again
      tableID = tableId;
      rowArray = map.rowArray;
      cellGrid = map.cellGrid;

      // review: make selection no matter what...
      if (isColumn) {
        selectColumn(view, cellGrid, fromIndex);
        tableButtonState.tableDimensions = getColumnDimensions(
          tableWrapperRect.x,
          tableBlockDOM
        );
      }

      if (!isColumn) {
        selectRow(view, cellGrid, fromIndex);
        tableButtonState.tableDimensions = getRowDimensions(
          tableWrapperRect.y,
          tableBlockDOM
        );
      }
    };

    const handleMouseMove = (e) => {
      const { tr, selection } = view.state;
      const { dispatch } = view;

      const {
        isPressed,
        startCoords,
        fromIndex,
        isColumn,
        tableDimensions,
        tableWrapperDOM,
      } = tableButtonState;

      // do nothing if button has not even been pressed
      if (!isPressed) return;

      const distance =
        Math.pow(e.clientX - startCoords.x, 2) +
        Math.pow(e.clientY - startCoords.y, 2);

      // set isDragging to true, when distance exceeds 25
      if (distance > 25) tableButtonState.isDragging = true;

      // isDragging matters only when it's true
      if (!tableButtonState.isDragging) return;

      // generate reorder handler
      // todo: hide the row or column button
      if (!tableButtonState.reorderHandlerDOM) {
        const handler = isColumn
          ? getColumnReorderHandler()
          : getRowReorderHandler();

        tableButtonState.reorderHandlerDOM = handler;
      }

      // movement
      if (isColumn) {
        // fix: optimize this
        const { x, y, width } = tableWrapperDOM.getBoundingClientRect();

        const minX = x;
        const maxX = x + width;
        const clampedX = Math.max(minX, Math.min(e.clientX, maxX));

        tableButtonState.reorderHandlerDOM.style.top = `${y + window.scrollY}px`;
        tableButtonState.reorderHandlerDOM.style.left = `${clampedX}px`;
      }

      // movement
      if (!isColumn) {
        // fix: optimize this
        const { x, y, height } = tableWrapperDOM.getBoundingClientRect();

        const minY = y;
        const maxY = y + height;
        const clampedY = Math.max(minY, Math.min(e.clientY, maxY));

        tableButtonState.reorderHandlerDOM.style.top = `${clampedY + window.scrollY}px`;
        tableButtonState.reorderHandlerDOM.style.left = `${x}px`;
      }

      const toIndex = getToIndex(
        e,
        tableDimensions,
        isColumn,
        tableWrapperDOM,
        fromIndex
      );

      // review: CRUCIAL
      tableButtonState.toIndex = toIndex;

      //
    };

    const handleMouseUp = () => {
      const { tr, selection } = view.state;
      const { dispatch } = view;

      if (tableButtonState.isDragging) {
        const { fromIndex, toIndex, isColumn } = tableButtonState;

        if (isColumn) {
          cellGrid.forEach((row) => {
            const fromData = row[fromIndex];
            const fromBefore = fromData.pos;
            const fromAfter = fromBefore + fromData.node.nodeSize;

            const toData = row[toIndex];
            const toBefore = toData.pos;
            const toAfter = toData.pos + toData.node.nodeSize;

            if (fromIndex > toIndex) {
              tr.delete(fromBefore, fromAfter).insert(toBefore, fromData.node);
            } else {
              tr.insert(toAfter, fromData.node).delete(fromBefore, fromAfter);
            }
          });

          dispatch(tr);
        }

        if (!isColumn) {
          const fromData = rowArray[fromIndex];
          const fromBefore = fromData.pos;
          const fromAfter = fromData.pos + fromData.node.nodeSize;

          const toData = rowArray[toIndex];
          const toBefore = toData.pos;
          const toAfter = toData.pos + toData.node.nodeSize;

          if (fromIndex > toIndex) {
            tr.delete(fromBefore, fromAfter).insert(toBefore, fromData.node);
          } else {
            tr.insert(toAfter, fromData.node).delete(fromBefore, fromAfter);
          }

          dispatch(tr);
        }

        console.log("reorder", { isColumn, fromIndex, toIndex }); // debug
      }

      if (tableButtonState.isPressed && !tableButtonState.isDragging) {
        console.log("show dropdown");
      }

      tableButtonState.isPressed = false;
      tableButtonState.isDragging = false;
      tableButtonState.startCoords = null;
      tableButtonState.fromIndex = null;
      tableButtonState.toIndex = null;

      tableButtonState.reorderHandlerDOM?.remove();
      tableButtonState.reorderHandlerDOM = null;
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

// // todo: reordering
// const fromIndex = parseInt(tableButton.dataset.tableButtonIndex);
// const toIndex = 5; // fix: hard-coded this value

// const fromRow = cellGrid[fromIndex]; // []
// const toRow = cellGrid[toIndex]; // []

// // todo
