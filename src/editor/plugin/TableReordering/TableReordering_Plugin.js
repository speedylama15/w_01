import { Plugin } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { CellSelection } from "@tiptap/pm/tables";

import { getIsDragging, isInclusive } from "../../../utils";
import { getTableMap } from "../../utils";
import { Fragment } from "@tiptap/pm/model";

const TABLE_REORDER_HIDE_CELLS = "TABLE_REORDER_HIDE_CELLS";
const TABLE_REORDER_HOVERED_CELLS = "TABLE_REORDER_HOVERED_CELLS";

const getColumnDimensions = (table, scrollLeft) => {
  const firstRowDOM = table.querySelector("tr");
  const cellDOMs = firstRowDOM.children;

  return Array.from(cellDOMs).map((cell) => {
    const rect = cell.getBoundingClientRect();

    return { start: rect.left + scrollLeft, end: rect.right + scrollLeft };
  });
};

const getRowDimensions = (table) => {
  const rowDOMs = table.querySelectorAll("tr");

  return Array.from(rowDOMs).map((row) => {
    const rect = row.getBoundingClientRect();

    return {
      start: rect.top + window.scrollY,
      end: rect.bottom + window.scrollY,
    };
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

const hollowColumn = (tableMap, index) => {
  const { grid } = tableMap;

  const decs = grid.map((row) => {
    const cell = row[index];

    const dec = Decoration.node(cell.pos, cell.pos + cell.node.nodeSize, {
      class: "hollow-cell",
    });

    return dec;
  });

  return decs;
};

const hollowRow = (tableMap, index) => {
  const { grid } = tableMap;

  const row = grid[index];

  const decs = row.map((cell) => {
    const dec = Decoration.node(cell.pos, cell.pos + cell.node.nodeSize, {
      class: "hollow-cell",
    });

    return dec;
  });

  return decs;
};

const targetColumn = (tableMap, direction, index) => {
  const { grid } = tableMap;

  const decs = grid.map((row) => {
    const cell = row[index];

    const dec = Decoration.node(cell.pos, cell.pos + cell.node.nodeSize, {
      class: `target-cell-${direction}`,
    });

    return dec;
  });

  return decs;
};

const targetRow = (tableMap, direction, index) => {
  const { grid } = tableMap;

  const row = grid[index];

  const decs = row.map((cell) => {
    const dec = Decoration.node(cell.pos, cell.pos + cell.node.nodeSize, {
      class: `target-cell-${direction}`,
    });

    return dec;
  });

  return decs;
};

// const convertCell = (tr, cell) => {
//   const {node, pos} = cell;

//   tr.setNodeMarkup(pos, schema.nodes.tableCell, cell.attrs)
// }

const HOLLOW_CELLS = "HOLLOW_CELLS";
const TARGET_CELLS = "TARGET_CELLS";
const RESET_CELLS = "RESET_CELLS";

export const TableReordering_Plugin = new Plugin({
  state: {
    init() {
      return {
        hollowDecs: [],
        targetDecs: [],
      };
    },

    apply(tr, value) {
      // console.log("apply"); // fix

      const hollowDecs = tr.getMeta(HOLLOW_CELLS);
      const targetDecs = tr.getMeta(TARGET_CELLS);
      const resetDecs = tr.getMeta(RESET_CELLS);

      if (hollowDecs) {
        return { ...value, hollowDecs };
      }

      if (targetDecs) {
        return { ...value, targetDecs };
      }

      if (resetDecs) {
        return {
          hollowDecs: [],
          targetDecs: [],
        };
      }

      return value;
    },
  },

  props: {
    decorations(state) {
      const { hollowDecs, targetDecs } = this.getState(state);

      return DecorationSet.create(state.doc, [...hollowDecs, ...targetDecs]);
    },
  },

  view(view) {
    let mouseState = "IDLE";
    let rafID = null;
    let isColumn = null;
    let dimensions = null;
    let tableWrapper = null;
    let tableNode = null;
    let tableMap = null;
    let mouseCoords = null;
    let fromIndex = null;
    let toIndex = null;

    const loop = () => {
      const { tr } = view.state;
      const { dispatch } = view;

      // fix: optimize
      const wrapperRect = tableWrapper.getBoundingClientRect();

      const left = wrapperRect.left + window.scrollX;
      const right = wrapperRect.right + window.scrollX;

      const { pageX } = mouseCoords;

      if (pageX - left <= 5) {
        tableWrapper.scrollBy(-5, 0);
      }

      if (right - pageX <= 5) {
        tableWrapper.scrollBy(5, 0);
      }

      const newToIndex = dimensions.findIndex((dimension) => {
        const { start, end } = dimension;

        const mouseCoord = isColumn ? mouseCoords.x : mouseCoords.y;

        return isInclusive(mouseCoord, start, end);
      });

      if (newToIndex !== toIndex) {
        // set decoration here
        if (newToIndex === -1 || newToIndex === fromIndex) {
          // clear out
          tr.setMeta("TARGET_CELLS", []);
          dispatch(tr);
        } else if (fromIndex > newToIndex) {
          const direction = isColumn ? "left" : "top";
          const decs = isColumn
            ? targetColumn(tableMap, direction, newToIndex)
            : targetRow(tableMap, direction, newToIndex);
          tr.setMeta("TARGET_CELLS", decs);
          dispatch(tr);
        } else if (fromIndex < newToIndex) {
          const direction = isColumn ? "right" : "bottom";
          const decs = isColumn
            ? targetColumn(tableMap, direction, newToIndex)
            : targetRow(tableMap, direction, newToIndex);
          tr.setMeta("TARGET_CELLS", decs);
          dispatch(tr);
        }
      }

      if (newToIndex === -1) {
        toIndex = null;
      } else {
        toIndex = newToIndex;
      }

      rafID = requestAnimationFrame(loop);
    };

    const down = (e) => {
      const { tr } = view.state;
      const { dispatch } = view;

      const tableButton = e.target.closest(".table-button");
      if (!tableButton) return;

      e.preventDefault();
      e.stopPropagation(); // this may be needed
      // fix: what if the user holds the button down but then proceeds to scroll?
      // any operation that needs to decide between drag or click
      // for some operations, when the mouse is held down, block scrolling immediately
      document.body.style.overflow = "hidden";

      mouseState = "DOWN";

      const startCoords = { x: e.pageX, y: e.pageY };

      const tableDOM = tableButton.closest(".block-table");
      tableWrapper = tableDOM.querySelector(".tableWrapper");

      const tableBefore = view.posAtDOM(tableDOM) - 1;
      tableNode = view.state.doc.nodeAt(tableBefore);
      tableMap = getTableMap(tableNode, tableBefore);

      fromIndex = parseInt(tableButton.getAttribute("data-index"));
      isColumn =
        tableButton.getAttribute("data-button-type") === "column"
          ? true
          : false;

      if (isColumn) selectColumn(tr, dispatch, tableMap, fromIndex);
      if (!isColumn) selectRow(tr, dispatch, tableMap, fromIndex);

      const move = (e) => {
        const { tr } = view.state;
        const { dispatch } = view;

        // fix: not sure if this is correct but we'll see
        mouseCoords = {
          x: e.pageX + tableWrapper.scrollLeft,
          y: e.pageY,
          clientX: e.clientX,
          clientY: e.clientY,
          pageX: e.pageX,
          pageY: e.pageY,
        };

        if (mouseState === "DOWN") {
          const isDragging = getIsDragging(
            startCoords,
            { x: e.pageX, y: e.pageY },
            20,
          );

          if (isDragging) {
            // todo: create a ghost
            mouseState = "DRAG";
            dimensions = isColumn
              ? getColumnDimensions(tableDOM, tableWrapper.scrollLeft)
              : getRowDimensions(tableDOM);
            const decs = isColumn
              ? hollowColumn(tableMap, fromIndex)
              : hollowRow(tableMap, fromIndex);
            tr.setMeta("HOLLOW_CELLS", decs);
            dispatch(tr);
          }
        }

        if (mouseState === "DRAG") {
          if (!rafID) rafID = requestAnimationFrame(loop);
        }
      };

      const up = () => {
        const { tr } = view.state;
        const { dispatch } = view;

        document.body.style.overflow = "";

        if (mouseState === "DOWN") {
          // open up a dropdown
        }

        if (mouseState === "DRAG") {
          // fix: I need to ensure that the mapped positions, esp in CellSelection are the most up to date
          if (fromIndex > toIndex && isColumn && toIndex !== null) {
            const { isHeaderColumn, isHeaderRow } = tableNode.attrs;
            const { tableCell, tableHeader } = view.state.schema.nodes;

            if (isHeaderColumn && !isHeaderRow && toIndex === 0) {
              const fromCells = [];
              const toCells = [];

              const { grid } = tableMap;

              grid.forEach((row) => {
                const fromCell = row[fromIndex];
                const toCell = row[toIndex];

                fromCells.push(fromCell);
                toCells.push(toCell);
              });

              let firstMappedToPos = null;
              let lastMappedToPos = null;

              toCells.forEach((toData, i) => {
                const { node: toCell, pos: toPos } = toData;
                const { node: fromCell, pos: fromPos } = fromCells[i];

                const convertedFromCell = tableHeader.create(
                  fromCell.attrs,
                  fromCell.content,
                  fromCell.marks,
                );

                const mappedToPos = tr.mapping.map(toPos);
                if (i === 0) firstMappedToPos = mappedToPos;
                if (i === toCells.length - 1) lastMappedToPos = mappedToPos;

                tr.setNodeMarkup(mappedToPos, tableCell, toCell.attrs);
                tr.insert(mappedToPos, convertedFromCell);

                const mappedFromPos = tr.mapping.map(fromPos);

                tr.delete(mappedFromPos, mappedFromPos + fromCell.nodeSize);
              });

              const sel = CellSelection.create(
                tr.doc,
                firstMappedToPos,
                lastMappedToPos,
              );

              tr.setSelection(sel);
            } else if (isHeaderColumn && isHeaderRow && toIndex === 0) {
              const fromCells = [];
              const toCells = [];

              const { grid } = tableMap;

              grid.forEach((row) => {
                const fromCell = row[fromIndex];
                const toCell = row[toIndex];

                fromCells.push(fromCell);
                toCells.push(toCell);
              });

              let firstMappedToPos = null;
              let lastMappedToPos = null;

              toCells.forEach((toData, i) => {
                const { node: toCell, pos: toPos } = toData;
                const { node: fromCell, pos: fromPos } = fromCells[i];

                const convertedFromCell = tableHeader.create(
                  fromCell.attrs,
                  fromCell.content,
                  fromCell.marks,
                );

                const mappedToPos = tr.mapping.map(toPos);
                if (i === 0) firstMappedToPos = mappedToPos;
                if (i === toCells.length - 1) lastMappedToPos = mappedToPos;

                if (i !== 0)
                  tr.setNodeMarkup(mappedToPos, tableCell, toCell.attrs);
                tr.insert(mappedToPos, convertedFromCell);

                const mappedFromPos = tr.mapping.map(fromPos);

                tr.delete(mappedFromPos, mappedFromPos + fromCell.nodeSize);
              });

              const sel = CellSelection.create(
                tr.doc,
                firstMappedToPos,
                lastMappedToPos,
              );

              tr.setSelection(sel);
            } else {
              const fromCells = [];
              const toCells = [];

              const { grid } = tableMap;

              grid.forEach((row) => {
                const fromCell = row[fromIndex];
                const toCell = row[toIndex];

                fromCells.push(fromCell);
                toCells.push(toCell);
              });

              let firstMappedToPos = null;
              let lastMappedToPos = null;

              toCells.forEach((toData, i) => {
                const { pos: toPos } = toData;
                const { node: fromCell, pos: fromPos } = fromCells[i];

                const mappedToPos = tr.mapping.map(toPos);
                if (i === 0) firstMappedToPos = mappedToPos;
                if (i === toCells.length - 1) lastMappedToPos = mappedToPos;

                tr.insert(mappedToPos, fromCell);

                const mappedFromPos = tr.mapping.map(fromPos);

                tr.delete(mappedFromPos, mappedFromPos + fromCell.nodeSize);
              });

              const sel = CellSelection.create(
                tr.doc,
                firstMappedToPos,
                lastMappedToPos,
              );

              tr.setSelection(sel);
            }
          }

          if (fromIndex < toIndex && isColumn && toIndex !== null) {
            const { isHeaderColumn, isHeaderRow } = tableNode.attrs;
            const { tableCell, tableHeader } = view.state.schema.nodes;

            if (isHeaderColumn && !isHeaderRow && fromIndex === 0) {
              const fromCells = [];
              const adjacentCells = [];
              const toCells = [];

              const { grid } = tableMap;

              grid.forEach((row) => {
                const fromCell = row[fromIndex];
                const adjacentCell = row[fromIndex + 1];
                const toCell = row[toIndex];

                fromCells.push(fromCell);
                adjacentCells.push(adjacentCell);
                toCells.push(toCell);
              });

              let firstMappedToPos = null;
              let lastMappedToPos = null;

              toCells.forEach((toData, i) => {
                const { node: toCell, pos: toPos } = toData;
                const { node: adjacentCell } = adjacentCells[i];
                const { node: fromCell, pos: fromPos } = fromCells[i];

                const mappedFromPos = tr.mapping.map(fromPos);

                // convert 0 + 1 cells to headers
                tr.setNodeMarkup(
                  mappedFromPos + fromCell.nodeSize,
                  tableHeader,
                  adjacentCell.attrs,
                );

                // create converted from cell
                const convertedFromCell = tableCell.create(
                  fromCell.attrs,
                  fromCell.content,
                  fromCell.marks,
                );

                const mappedToPos = tr.mapping.map(toPos) + toCell.nodeSize;
                tr.insert(mappedToPos, convertedFromCell);
                tr.delete(mappedFromPos, mappedFromPos + fromCell.nodeSize);

                if (i === 0) {
                  firstMappedToPos = mappedToPos - fromCell.nodeSize;
                }
                if (i === toCells.length - 1) {
                  lastMappedToPos = mappedToPos - fromCell.nodeSize;
                }
              });

              const sel = CellSelection.create(
                tr.doc,
                firstMappedToPos,
                lastMappedToPos,
              );

              tr.setSelection(sel);
            } else if (isHeaderColumn && isHeaderRow && fromIndex === 0) {
              const fromCells = [];
              const adjacentCells = [];
              const toCells = [];

              const { grid } = tableMap;

              grid.forEach((row) => {
                const fromCell = row[fromIndex];
                const adjacentCell = row[fromIndex + 1];
                const toCell = row[toIndex];

                fromCells.push(fromCell);
                adjacentCells.push(adjacentCell);
                toCells.push(toCell);
              });

              let firstMappedToPos = null;
              let lastMappedToPos = null;

              toCells.forEach((toData, i) => {
                const { node: toCell, pos: toPos } = toData;
                const { node: adjacentCell } = adjacentCells[i];
                const { node: fromCell, pos: fromPos } = fromCells[i];

                const mappedFromPos = tr.mapping.map(fromPos);

                // convert 0 + 1 cells to headers
                tr.setNodeMarkup(
                  mappedFromPos + fromCell.nodeSize,
                  tableHeader,
                  adjacentCell.attrs,
                );

                // create converted from cell
                const convertedFromCell =
                  i === 0
                    ? fromCell
                    : tableCell.create(
                        fromCell.attrs,
                        fromCell.content,
                        fromCell.marks,
                      );

                const mappedToPos = tr.mapping.map(toPos) + toCell.nodeSize;

                tr.insert(mappedToPos, convertedFromCell);
                tr.delete(mappedFromPos, mappedFromPos + fromCell.nodeSize);

                if (i === 0) {
                  firstMappedToPos = mappedToPos - fromCell.nodeSize;
                }
                if (i === toCells.length - 1) {
                  lastMappedToPos = mappedToPos - fromCell.nodeSize;
                }
              });

              const sel = CellSelection.create(
                tr.doc,
                firstMappedToPos,
                lastMappedToPos,
              );

              tr.setSelection(sel);
            } else {
              const fromCells = [];
              const toCells = [];

              const { grid } = tableMap;

              grid.forEach((row) => {
                const fromCell = row[fromIndex];
                const toCell = row[toIndex];

                fromCells.push(fromCell);
                toCells.push(toCell);
              });

              let firstMappedToPos = null;
              let lastMappedToPos = null;

              toCells.forEach((toData, i) => {
                const { node: toCell, pos: toPos } = toData;
                const { node: fromCell, pos: fromPos } = fromCells[i];

                const mappedFromPos = tr.mapping.map(fromPos);

                const mappedToPos = tr.mapping.map(toPos) + toCell.nodeSize;

                tr.insert(mappedToPos, fromCell);
                tr.delete(mappedFromPos, mappedFromPos + fromCell.nodeSize);

                if (i === 0) {
                  firstMappedToPos = mappedToPos - fromCell.nodeSize;
                }
                if (i === toCells.length - 1) {
                  lastMappedToPos = mappedToPos - fromCell.nodeSize;
                }
              });

              const sel = CellSelection.create(
                tr.doc,
                firstMappedToPos,
                lastMappedToPos,
              );

              tr.setSelection(sel);
            }
          }

          if (fromIndex > toIndex && !isColumn && toIndex !== null) {
            const { isHeaderColumn, isHeaderRow } = tableNode.attrs;
            const { tableRow, tableCell, tableHeader } =
              view.state.schema.nodes;

            if (!isHeaderColumn && isHeaderRow && toIndex === 0) {
              const { grid, rows } = tableMap;

              const content = [];

              const toRow = grid[toIndex];
              toRow.forEach((toData) => {
                const { node: toCell, pos: toPos } = toData;

                tr.setNodeMarkup(toPos, tableCell, toCell.attrs);
              });

              const fromRow = grid[fromIndex];
              fromRow.forEach((fromData) => {
                const { node: fromCell } = fromData;

                const convertedFromCell = tableHeader.create(
                  fromCell.attrs,
                  fromCell.content,
                  fromCell.marks,
                );

                content.push(convertedFromCell);
              });

              const fromRowBefore = rows[fromIndex].pos;
              const fromRowAfter =
                fromRowBefore + rows[fromIndex].node.nodeSize;
              tr.delete(fromRowBefore, fromRowAfter);

              const toRowBefore = rows[toIndex].pos;
              const convertedFromRow = tableRow.create(
                null,
                Fragment.from(content),
              );
              tr.insert(toRowBefore, convertedFromRow);

              const sel = CellSelection.create(
                tr.doc,
                toRowBefore + 1,
                toRowBefore +
                  convertedFromRow.nodeSize -
                  content[content.length - 1].nodeSize -
                  1,
              );

              tr.setSelection(sel);
            } else if (isHeaderColumn && isHeaderRow && toIndex === 0) {
              const { grid, rows } = tableMap;

              const content = [];

              const toRow = grid[toIndex];
              toRow.forEach((toData, i) => {
                const { node: toCell, pos: toPos } = toData;

                if (i !== 0) tr.setNodeMarkup(toPos, tableCell, toCell.attrs);
              });

              const fromRow = grid[fromIndex];
              fromRow.forEach((fromData) => {
                const { node: fromCell } = fromData;

                const convertedFromCell = tableHeader.create(
                  fromCell.attrs,
                  fromCell.content,
                  fromCell.marks,
                );

                content.push(convertedFromCell);
              });

              const fromRowBefore = rows[fromIndex].pos;
              const fromRowAfter =
                fromRowBefore + rows[fromIndex].node.nodeSize;
              tr.delete(fromRowBefore, fromRowAfter);

              const toRowBefore = rows[toIndex].pos;
              const convertedFromRow = tableRow.create(
                null,
                Fragment.from(content),
              );
              tr.insert(toRowBefore, convertedFromRow);

              const sel = CellSelection.create(
                tr.doc,
                toRowBefore + 1,
                toRowBefore +
                  convertedFromRow.nodeSize -
                  content[content.length - 1].nodeSize -
                  1,
              );

              tr.setSelection(sel);
            } else {
              const { grid, rows } = tableMap;

              const fromRow = rows[fromIndex].node;

              const fromRowBefore = rows[fromIndex].pos;
              const fromRowAfter =
                fromRowBefore + rows[fromIndex].node.nodeSize;
              tr.delete(fromRowBefore, fromRowAfter);

              const toRowBefore = rows[toIndex].pos;

              tr.insert(toRowBefore, fromRow);

              const sel = CellSelection.create(
                tr.doc,
                toRowBefore + 1,
                toRowBefore +
                  fromRow.nodeSize -
                  grid[fromIndex][grid[fromIndex].length - 1].node.nodeSize -
                  1,
              );

              tr.setSelection(sel);
            }
          }

          if (fromIndex < toIndex && !isColumn && toIndex !== null) {
            const { isHeaderColumn, isHeaderRow } = tableNode.attrs;
            const { tableRow, tableCell, tableHeader } =
              view.state.schema.nodes;

            if (!isHeaderColumn && isHeaderRow && fromIndex === 0) {
              const { grid, rows } = tableMap;

              const fromPlus1Row = grid[fromIndex + 1];
              fromPlus1Row.forEach((plus1Data) => {
                const { node: plus1Node, pos: plus1Pos } = plus1Data;

                tr.setNodeMarkup(plus1Pos, tableHeader, plus1Node.attrs);
              });

              const content = [];
              const fromRow = grid[fromIndex];
              fromRow.forEach((fromData) => {
                const { node: fromCell, pos: fromPos } = fromData;

                const convertedFromCell = tableCell.create(
                  fromCell.attrs,
                  fromCell.content,
                  fromCell.marks,
                );

                content.push(convertedFromCell);
              });

              const toRowAfter =
                rows[toIndex].pos + rows[toIndex].node.nodeSize;
              const convertedFromRow = tableRow.create(
                null,
                Fragment.from(content),
              );
              tr.insert(toRowAfter, convertedFromRow);

              const fromRowBefore = rows[fromIndex].pos;
              const fromRowAfter =
                fromRowBefore + rows[fromIndex].node.nodeSize;
              tr.delete(fromRowBefore, fromRowAfter);

              const b1 = toRowAfter - convertedFromRow.nodeSize;
              const b2 =
                b1 +
                convertedFromRow.nodeSize -
                content[content.length - 1].nodeSize;

              const sel = CellSelection.create(tr.doc, b1 + 1, b2 - 1);

              tr.setSelection(sel);
            } else if (isHeaderColumn && isHeaderRow && fromIndex === 0) {
              const { grid, rows } = tableMap;

              const fromPlus1Row = grid[fromIndex + 1];
              fromPlus1Row.forEach((plus1Data) => {
                const { node: plus1Node, pos: plus1Pos } = plus1Data;

                tr.setNodeMarkup(plus1Pos, tableHeader, plus1Node.attrs);
              });

              const content = [];
              const fromRow = grid[fromIndex];
              fromRow.forEach((fromData, i) => {
                const { node: fromCell } = fromData;

                const convertedFromCell =
                  i === 0
                    ? fromCell
                    : tableCell.create(
                        fromCell.attrs,
                        fromCell.content,
                        fromCell.marks,
                      );

                content.push(convertedFromCell);
              });

              const toRowAfter =
                rows[toIndex].pos + rows[toIndex].node.nodeSize;
              const convertedFromRow = tableRow.create(
                null,
                Fragment.from(content),
              );
              tr.insert(toRowAfter, convertedFromRow);

              const fromRowBefore = rows[fromIndex].pos;
              const fromRowAfter =
                fromRowBefore + rows[fromIndex].node.nodeSize;
              tr.delete(fromRowBefore, fromRowAfter);

              const b1 = toRowAfter - convertedFromRow.nodeSize;
              const b2 =
                b1 +
                convertedFromRow.nodeSize -
                content[content.length - 1].nodeSize;

              const sel = CellSelection.create(tr.doc, b1 + 1, b2 - 1);

              tr.setSelection(sel);
            } else {
              const { grid, rows } = tableMap;

              const fromRow = rows[fromIndex].node;

              const toRowAfter =
                rows[toIndex].pos + rows[toIndex].node.nodeSize;
              tr.insert(toRowAfter, fromRow);

              const fromRowBefore = rows[fromIndex].pos;
              const fromRowAfter =
                fromRowBefore + rows[fromIndex].node.nodeSize;
              tr.delete(fromRowBefore, fromRowAfter);

              const b1 = toRowAfter - fromRow.nodeSize;
              const b2 =
                b1 +
                fromRow.nodeSize -
                grid[fromIndex][grid[fromIndex].length - 1].node.nodeSize;

              const sel = CellSelection.create(tr.doc, b1 + 1, b2 - 1);

              tr.setSelection(sel);
            }
          }

          tr.setMeta(RESET_CELLS, true);
          dispatch(tr);

          cancelAnimationFrame(rafID);
          rafID = null;
          mouseState = "IDLE";
          isColumn = null;
          dimensions = null;
          tableWrapper = null;
          tableNode = null;
          tableMap = null;
          mouseCoords = null;
          fromIndex = null;
          toIndex = null;
        }

        mouseState = "IDLE";

        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
      };

      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    };

    //   const { tr } = view.state;
    //   const { dispatch } = view;

    //   // fix: conversion from cell <-> header
    //   if (operation === "TABLE_REORDER") {
    //     if (isColumn) {
    //       if (fromIndex > toIndex) {
    //         const cells = tableMap.grid.map((row) => row[fromIndex]);
    //         const insertPosArr = tableMap.grid.map((row) => row[toIndex].pos);

    //         // First insert (at original positions, mapped)
    //         insertPosArr.forEach((pos, i) => {
    //           const mappedPos = tr.mapping.map(pos);

    //           tr.insert(mappedPos, cells[i].node);
    //         });

    //         cells.forEach((cell) => {
    //           const mappedPos = tr.mapping.map(cell.pos);

    //           tr.delete(mappedPos, mappedPos + cell.node.nodeSize);
    //         });
    //       }

    //       if (fromIndex < toIndex) {
    //         const cells = tableMap.grid.map((row) => row[fromIndex]);
    //         const insertPosArr = tableMap.grid.map(
    //           (row) => row[toIndex].pos + row[toIndex].node.nodeSize,
    //         );

    //         insertPosArr.forEach((pos, i) => {
    //           const mappedPos = tr.mapping.map(pos);

    //           tr.insert(mappedPos, cells[i].node);
    //         });

    //         cells.forEach((cell) => {
    //           const mappedPos = tr.mapping.map(cell.pos);

    //           tr.delete(mappedPos, mappedPos + cell.node.nodeSize);
    //         });
    //       }

    //       const newTableNode = tr.doc.nodeAt(tableBefore);
    //       const newTableMap = getTableMap(newTableNode, tableBefore);
    //       const start = newTableMap.grid[0][toIndex].pos;
    //       const end =
    //         newTableMap.grid[newTableMap.grid.length - 1][toIndex].pos;

    //       tr.setSelection(CellSelection.create(tr.doc, start, end));
    //     }
    //   }

    //   if (rafID) {
    //     cancelAnimationFrame(rafID);
    //     rafID = null;
    //   }

    //   mouseState = "IDLE";
    //   operation = null;

    //   tableMap = null;
    //   dimensions = null;

    //   blockDOM = null;
    //   containerDOM = null;
    //   containerRect = null;

    //   fromIndex = null;

    //   startCoords = null;
    //   currentCoords = null;

    //   isColumn = null;

    //   tr.setMeta("FROM", []);
    //   tr.setMeta("TO", []);

    //   dispatch(tr);
    // };

    view.root.addEventListener("mousedown", down);

    return {
      destroy() {
        view.root.removeEventListener("mousedown", down);
      },
    };
  },
});

export default TableReordering_Plugin;
