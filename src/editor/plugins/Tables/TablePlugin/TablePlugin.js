import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { CellSelection } from "@tiptap/pm/tables";

import { getByContentType } from "../../../utils/depth/getByContentType";
import { getColumnDimensions } from "../../../utils/getColumnDimensions";
import { getRowDimensions } from "../../../utils/getRowDimensions";
import { getTableBlockDOM } from "../../../utils/getTableBlockDOM";

const REORDER_HIDE_CELLS = "REORDER_HIDE_CELLS";
const REORDER_HOVERED_CELLS = "REORDER_HOVERED_CELLS";

const getTableButtonAttributes = (tableButton) => {
  const { tableId } = tableButton.dataset;
  const isColumn = JSON.parse(tableButton.dataset.isColumn);
  const fromIndex = parseInt(tableButton.dataset.fromIndex);

  return { tableId, isColumn, fromIndex };
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

const getColumnSelection = (doc, cellGrid, index) => {
  const firstRow = cellGrid[0];
  const lastRow = cellGrid[cellGrid.length - 1];

  const cellSelection = CellSelection.create(
    doc,
    firstRow[index].pos,
    lastRow[index].pos
  );

  return cellSelection;
};

const getRowSelection = (doc, cellGrid, index) => {
  const row = cellGrid[index];
  const firstCell = row[0];
  const lastCell = row[row.length - 1];

  const cellSelection = CellSelection.create(doc, firstCell.pos, lastCell.pos);

  return cellSelection;
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

const isHeaderColumn = (cellGrid, index) => {
  let isHeader = true;

  cellGrid.forEach((row) => {
    const cell = row[index];

    if (cell.node.type.name !== "tableHeader") isHeader = false;
  });

  return isHeader;
};

const isHeaderRow = (cellGrid, index) => {
  let isHeader = true;

  // get the corresponding row
  const row = cellGrid[index];

  row.forEach((cell) => {
    if (cell.node.type.name !== "tableHeader") isHeader = false;
  });

  return isHeader;
};

const TablePluginKey = new PluginKey("TablePluginKey");

export const TablePlugin = new Plugin({
  key: TablePluginKey,

  state: {
    init() {
      return {
        hiddenCellDecorations: [],
        hoveredCellDecorations: [],
      };
    },

    apply(tr, value) {
      const hiddenCells = tr.getMeta(REORDER_HIDE_CELLS);
      const hoveredCells = tr.getMeta(REORDER_HOVERED_CELLS);

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
  },

  view(view) {
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
      tableWrapperRect: null,
      tableDimensions: null,
      reorderHandlerDOM: null,
      tableButtonDOM: null,
      tableNode: null,
      tableBefore: null,
      tableAfter: null,
    };

    const handleMouseDown = (e) => {
      const { selection, tr } = view.state;
      const { dispatch } = view;
      const { $from } = selection;

      if (e.button !== 0) return;

      const tableButton = e.target.closest(".table-button");

      if (!tableButton) return;

      const { tableId, isColumn, fromIndex } =
        getTableButtonAttributes(tableButton);

      const tableBlockDOM = getTableBlockDOM(tableId);
      const tableWrapperDOM = tableBlockDOM.querySelector(".tableWrapper");
      const tableWrapperRect = tableWrapperDOM.getBoundingClientRect(); // I need wrapper over the block because the block has a padding

      tableButtonState.isPressed = true;
      tableButtonState.startCoords = { x: e.clientX, y: e.clientY };
      tableButtonState.fromIndex = fromIndex;
      tableButtonState.isColumn = isColumn;
      tableButtonState.tableBlockDOM = tableBlockDOM;
      tableButtonState.tableWrapperDOM = tableWrapperDOM;
      tableButtonState.tableButtonDOM = tableButton;
      tableButtonState.tableID = tableId;
      tableButtonState.tableWrapperRect = tableWrapperRect;

      const tableResult = getByContentType($from, "table");
      const tableBefore = $from.before(tableResult.depth);
      const tableNode = $from.node(tableResult.depth);
      const tableAfter = tableBefore + tableNode.nodeSize;

      const map = getTableMap(tableNode, tableBefore, tableAfter);

      tableButtonState.tableNode = tableNode;
      tableButtonState.tableBefore = tableBefore;
      tableButtonState.tableAfter = tableAfter;

      rowArray = map.rowArray;
      cellGrid = map.cellGrid;

      if (isColumn) {
        const columnSelection = getColumnSelection(tr.doc, cellGrid, fromIndex);

        tableButtonState.tableDimensions = getColumnDimensions(
          tableWrapperRect.x,
          tableWrapperDOM
        );

        tr.setSelection(columnSelection);

        dispatch(tr);
      }

      if (!isColumn) {
        const rowSelection = getRowSelection(tr.doc, cellGrid, fromIndex);

        tableButtonState.tableDimensions = getRowDimensions(
          tableWrapperRect.y,
          tableWrapperDOM
        );

        tr.setSelection(rowSelection);

        dispatch(tr);
      }
    };

    const handleMouseMove = (e) => {
      const { tr } = view.state;
      const { dispatch } = view;

      const {
        isPressed,
        startCoords,
        fromIndex,
        isColumn,
        tableDimensions,
        tableWrapperDOM,
        tableWrapperRect,
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
      if (!tableButtonState.reorderHandlerDOM) {
        const handler = isColumn
          ? getColumnReorderHandler()
          : getRowReorderHandler();

        tableButtonState.reorderHandlerDOM = handler;

        const decorations = [];

        if (isColumn) {
          cellGrid.forEach((row) => {
            const cell = row[fromIndex];

            const from = cell.pos;
            const to = cell.pos + cell.node.nodeSize;

            const decoration = Decoration.node(from, to, {
              class: "hidden-cell",
            });

            decorations.push(decoration);
          });

          dispatch(tr.setMeta(REORDER_HIDE_CELLS, decorations));
        }

        if (!isColumn) {
          const row = cellGrid[fromIndex];

          row.forEach((cell) => {
            const from = cell.pos;
            const to = cell.pos + cell.node.nodeSize;

            const decoration = Decoration.node(from, to, {
              class: "hidden-cell",
            });

            decorations.push(decoration);
          });

          dispatch(tr.setMeta(REORDER_HIDE_CELLS, decorations));
        }
      }

      // movement
      if (isColumn) {
        const { x, y, width } = tableWrapperRect;

        const minX = x;
        const maxX = x + width;
        const clampedX = Math.max(minX, Math.min(e.clientX, maxX));

        tableButtonState.reorderHandlerDOM.style.top = `${y + window.scrollY}px`;
        tableButtonState.reorderHandlerDOM.style.left = `${clampedX}px`;
      }

      // movement
      if (!isColumn) {
        const { x, y, height } = tableWrapperRect;

        const minY = y;
        const maxY = y + height;
        const clampedY = Math.max(minY, Math.min(e.clientY, maxY));

        tableButtonState.reorderHandlerDOM.style.top = `${clampedY + window.scrollY}px`;
        tableButtonState.reorderHandlerDOM.style.left = `${x}px`;
      }

      // review: CRUCIAL
      const toIndex = getToIndex(
        e,
        tableDimensions,
        isColumn,
        tableWrapperDOM,
        fromIndex
      );

      tableButtonState.toIndex = toIndex;

      let decorations = [];

      if (toIndex === null) {
        dispatch(tr.setMeta(REORDER_HOVERED_CELLS, null));

        return;
      }

      if (isColumn && toIndex !== null && fromIndex !== toIndex) {
        cellGrid.forEach((row) => {
          const cell = row[toIndex];

          const from = cell.pos;
          const to = cell.pos + cell.node.nodeSize;

          const name =
            fromIndex < toIndex ? "hovered-cell_right" : "hovered-cell_left";

          const decoration = Decoration.node(from, to, {
            class: name,
          });

          decorations.push(decoration);
        });

        dispatch(tr.setMeta(REORDER_HOVERED_CELLS, decorations));

        return;
      }

      if (!isColumn && toIndex !== null && fromIndex !== toIndex) {
        const row = cellGrid[toIndex];

        row.forEach((cell) => {
          const from = cell.pos;
          const to = cell.pos + cell.node.nodeSize;

          const className =
            fromIndex < toIndex ? "hovered-cell_below" : "hovered-cell_above";

          const decoration = Decoration.node(from, to, {
            class: className,
          });

          decorations.push(decoration);
        });

        dispatch(tr.setMeta(REORDER_HOVERED_CELLS, decorations));

        return;
      }
      //
    };

    const handleMouseUp = () => {
      const { tr } = view.state;
      const { dispatch } = view;

      if (tableButtonState.isDragging) {
        const { fromIndex, toIndex, isColumn } = tableButtonState;

        // reorder column
        if (isColumn && fromIndex !== toIndex && toIndex !== null) {
          // toIndex > fromIndex
          if (fromIndex === 0) {
            const isHeader = isHeaderColumn(cellGrid, fromIndex);

            cellGrid.forEach((row) => {
              const fromCell = row[fromIndex];
              const fromBefore = fromCell.pos;
              const fromAfter = fromBefore + fromCell.node.nodeSize;

              const toCell = row[toIndex];
              // const toBefore = toCell.pos;
              const toAfter = toCell.pos + toCell.node.nodeSize;

              if (isHeader) {
                const cellIndex1 = row[1];

                tr.setNodeMarkup(
                  cellIndex1.pos,
                  view.state.schema.nodes.tableHeader
                );
              }

              tr.insert(toAfter, fromCell.node);

              if (isHeader) {
                tr.setNodeMarkup(toAfter, view.state.schema.nodes.tableCell);
              }

              tr.delete(fromBefore, fromAfter);
            });
          }

          // fromIndex > toIndex
          if (toIndex === 0) {
            const isHeader = isHeaderColumn(cellGrid, toIndex);

            cellGrid.forEach((row) => {
              const fromCell = row[fromIndex];
              const fromBefore = fromCell.pos;
              const fromAfter = fromBefore + fromCell.node.nodeSize;

              const toCell = row[toIndex];
              const toBefore = toCell.pos;
              // const toAfter = toCell.pos + toCell.node.nodeSize;

              if (isHeader) {
                const cellIndex0 = row[0];

                tr.setNodeMarkup(
                  cellIndex0.pos,
                  view.state.schema.nodes.tableCell
                );
              }

              tr.delete(fromBefore, fromAfter);
              tr.insert(toBefore, fromCell.node);

              if (isHeader) {
                tr.setNodeMarkup(toBefore, view.state.schema.nodes.tableHeader);
              }
            });
          }

          if (fromIndex !== 0 && toIndex !== 0) {
            cellGrid.forEach((row) => {
              const fromCell = row[fromIndex];
              const fromBefore = fromCell.pos;
              const fromAfter = fromBefore + fromCell.node.nodeSize;

              const toCell = row[toIndex];
              const toBefore = toCell.pos;
              const toAfter = toCell.pos + toCell.node.nodeSize;

              if (fromIndex > toIndex) {
                tr.delete(fromBefore, fromAfter);
                tr.insert(toBefore, fromCell.node);
              } else {
                tr.insert(toAfter, fromCell.node);
                tr.delete(fromBefore, fromAfter);
              }
            });
          }
        }

        // reorder row
        if (!isColumn && fromIndex !== toIndex && toIndex !== null) {
          const fromRow = rowArray[fromIndex];
          const fromBefore = fromRow.pos;
          const fromAfter = fromRow.pos + fromRow.node.nodeSize;

          const toRow = rowArray[toIndex];
          const toBefore = toRow.pos;
          const toAfter = toRow.pos + toRow.node.nodeSize;

          if (fromIndex === 0) {
            // check if the row is a header
            const isHeader = isHeaderRow(cellGrid, fromIndex);

            // if true
            if (isHeader) {
              // get row index 1
              const rowIndex1 = cellGrid[1];

              // set all the cells to header
              rowIndex1.forEach((cell) => {
                tr.setNodeMarkup(cell.pos, view.state.schema.nodes.tableHeader);
              });
            }

            // toIndex will always be greater because fromIndex is 0
            tr.insert(toAfter, fromRow.node);

            if (isHeader) {
              // get the inserted row
              const insertRowNode = tr.doc.nodeAt(toAfter);

              // set all of them to tableCell
              insertRowNode.descendants((node, pos) => {
                if (
                  node.type.name === "tableHeader" ||
                  node.type.name === "tableCell"
                ) {
                  const cellBefore = toAfter + pos + 1;

                  tr.setNodeMarkup(
                    cellBefore,
                    view.state.schema.nodes.tableCell
                  );

                  return false;
                }
              });
            }

            // delete
            tr.delete(fromBefore, fromAfter);
          }

          if (toIndex === 0) {
            // check if the row is a header
            const isHeader = isHeaderRow(cellGrid, toIndex);

            if (isHeader) {
              // get row 0
              const rowIndex0 = cellGrid[0];

              // set all the cells to cell
              rowIndex0.forEach((cell) => {
                tr.setNodeMarkup(cell.pos, view.state.schema.nodes.tableCell);
              });
            }

            // fromIndex will always be greater because toIndex is 0
            tr.delete(fromBefore, fromAfter);
            tr.insert(toBefore, fromRow.node);

            if (isHeader) {
              // get the inserted row
              const insertRowNode = tr.doc.nodeAt(toBefore);

              // set all of them to tableHeader
              insertRowNode.descendants((node, pos) => {
                if (
                  node.type.name === "tableHeader" ||
                  node.type.name === "tableCell"
                ) {
                  const cellBefore = toBefore + pos + 1;

                  tr.setNodeMarkup(
                    cellBefore,
                    view.state.schema.nodes.tableHeader
                  );

                  return false;
                }
              });
            }
          }

          if (fromIndex !== 0 && toIndex !== 0) {
            if (fromIndex > toIndex) {
              tr.delete(fromBefore, fromAfter).insert(toBefore, fromRow.node);
            } else {
              tr.insert(toAfter, fromRow.node).delete(fromBefore, fromAfter);
            }
          }
        }

        // get the updated tableNode through tr.doc and not state.doc
        const tableNode = tr.doc.nodeAt(tableButtonState.tableBefore);

        const map = getTableMap(
          tableNode,
          tableButtonState.tableBefore,
          tableButtonState.tableAfter
        );

        if (isColumn && fromIndex !== toIndex && toIndex !== null) {
          const cellSelection = getColumnSelection(
            tr.doc,
            map.cellGrid,
            toIndex
          );

          tr.setSelection(cellSelection);
        }

        if (!isColumn && fromIndex !== toIndex && toIndex !== null) {
          const cellSelection = getRowSelection(tr.doc, map.cellGrid, toIndex);

          tr.setSelection(cellSelection);
        }
      }

      if (tableButtonState.isPressed && !tableButtonState.isDragging) {
        console.log("show dropdown");

        // need tableButton's rect
        const { tableButtonDOM } = tableButtonState;

        tr.setMeta("open-table-dropdown", {
          isOpen: true,
          rect: tableButtonDOM.getBoundingClientRect(),
        });
      }

      tableButtonState.isPressed = false;
      tableButtonState.isDragging = false;
      tableButtonState.startCoords = null;
      tableButtonState.fromIndex = null;
      tableButtonState.toIndex = null;

      tableButtonState.reorderHandlerDOM?.remove();
      tableButtonState.reorderHandlerDOM = null;

      tr.setMeta(REORDER_HIDE_CELLS, null).setMeta(REORDER_HOVERED_CELLS, null);

      dispatch(tr);
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
