import { Plugin, PluginKey } from "@tiptap/pm/state";
import {
  CellSelection,
  TableMap,
  moveTableColumn,
  moveTableRow,
} from "@tiptap/pm/tables";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

import { cloneColumn } from "./utils/cloneColumn";
import { cloneRow } from "./utils/cloneRow";
import { getHoveredCells_COLUMN } from "./utils/getHoveredCells_COLUMN";
import { getHoveredCells_ROW } from "./utils/getHoveredCells_ROW";
import { getTableCellDimensions_COLUMN } from "./utils/getTableCellDimensions_COLUMN";
import { getTableCellDimensions_ROW } from "./utils/getTableCellDimensions_ROW";

const REORDER_HIDE_CELLS = "REORDER_HIDE_CELLS";
const REORDER_HOVERED_CELLS = "REORDER_HOVERED_CELLS";

export const CellButtonKey = new PluginKey("CellButtonKey");

export const CellButton = new Plugin({
  key: CellButtonKey,

  // REVIEW: STATE
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
        const hiddenCellDecorations = hiddenCells.map((cell) => {
          const { from, to } = cell;

          return Decoration.node(from, to, { class: "hidden-cell" });
        });

        return { ...value, hiddenCellDecorations };
      }

      if (hoveredCells) {
        const hoveredCellDecorations = hoveredCells.map((cell) => {
          const { from, to, direction } = cell;

          return Decoration.node(from, to, {
            class: `hovered-cell_${direction}`,
          });
        });

        return { ...value, hoveredCellDecorations };
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

  // REVIEW: VIEW
  view(view) {
    let mouseX = 0;
    let scrollIntervalID = null;

    const tableButtonState = {
      isPressed: false,
      isReordering: false,

      tableCellDimensions: null,
      clonedDOM: null,

      startCoords: null,
      grabbedIndex: null,
      targetIndex: null,
      tableButtonType: null, // row or column

      tableButtonDOM: null,

      tableBlockMap: null,
      tableBlockDOM: null,
      tableBlockRect: null,
      tableBlockNode: null,
      tableBlockStart: null,
    };

    const handleMouseDown = (e) => {
      const { tr } = view.state;
      const { dispatch } = view;

      if (e.button !== 0) return;

      const tableButton = e.target.closest(".table-button");
      if (!tableButton) return;

      const tableBlockDOM = e.target.closest(`div[data-content-type="table"]`);
      if (!tableBlockDOM) return;

      e.preventDefault();
      // todo: figure out the different mousedown event handlers
      e.stopPropagation();

      tableButtonState.tableButtonDOM = tableButton;

      const tableButtonType = tableButton.dataset.tableButtonType;
      const buttonIndex = parseInt(tableButton.dataset.tableButtonIndex);

      const tableBlockStart = view.posAtDOM(tableBlockDOM);
      const tableBlockBefore = tableBlockStart - 1;
      const tableBlockNode = view.state.doc.nodeAt(tableBlockBefore); // to get tableMap
      const tableBlockMap = TableMap.get(tableBlockNode); // to get the col/row selection

      if (tableButtonType === "column") {
        const cellPos = tableBlockStart + tableBlockMap.map[buttonIndex];
        const $cell = view.state.doc.resolve(cellPos);
        const colSelection = CellSelection.colSelection($cell); // get the col selection

        const tableBlockRect = tableBlockDOM.getBoundingClientRect();
        const tableCellDimensions = getTableCellDimensions_COLUMN(
          tableBlockRect.x,
          tableBlockDOM
        );

        tableButtonState.isPressed = true;

        tableButtonState.tableCellDimensions = tableCellDimensions;

        tableButtonState.startCoords = { x: e.clientX, y: e.clientY };
        tableButtonState.grabbedIndex = buttonIndex;
        tableButtonState.tableButtonType = tableButtonType;

        tableButtonState.tableBlockMap = tableBlockMap;
        tableButtonState.tableBlockDOM = tableBlockDOM;
        tableButtonState.tableBlockRect = tableBlockRect;
        tableButtonState.tableBlockNode = tableBlockNode;
        tableButtonState.tableBlockStart = tableBlockStart;

        tr.setSelection(colSelection); // review: selection will ALWAYS be made

        dispatch(tr);

        // review: scrolling the tableWrapper
        const tableWrapperDOM = tableBlockDOM.querySelector(".tableWrapper");

        mouseX = e.clientX;

        scrollIntervalID = setInterval(() => {
          const rect = tableWrapperDOM.getBoundingClientRect();

          if (mouseX < rect.left) {
            tableWrapperDOM.scrollLeft -= 24;
          } else if (mouseX > rect.right) {
            tableWrapperDOM.scrollLeft += 24;
          }
        }, 15);
        // review

        return;
      }

      if (tableButtonType === "row") {
        const cellPos =
          tableBlockStart +
          tableBlockMap.map[tableBlockMap.width * buttonIndex];
        const $cell = view.state.doc.resolve(cellPos);
        const rowSelection = CellSelection.rowSelection($cell);

        // todo: here show the dropdown if criteria is met

        const tableBlockRect = tableBlockDOM.getBoundingClientRect();
        const tableCellDimensions = getTableCellDimensions_ROW(
          tableBlockRect.y,
          tableBlockDOM
        );

        tableButtonState.isPressed = true;

        tableButtonState.tableCellDimensions = tableCellDimensions;

        tableButtonState.startCoords = { x: e.clientX, y: e.clientY };
        tableButtonState.grabbedIndex = buttonIndex;
        tableButtonState.tableButtonType = tableButtonType;

        tableButtonState.tableBlockMap = tableBlockMap;
        tableButtonState.tableBlockDOM = tableBlockDOM;
        tableButtonState.tableBlockRect = tableBlockRect;
        tableButtonState.tableBlockNode = tableBlockNode;
        tableButtonState.tableBlockStart = tableBlockStart;

        tr.setSelection(rowSelection); // review: selection will ALWAYS be made

        dispatch(tr);

        return;
      }

      return true;
    };

    const handleMouseMove = (e) => {
      const { tr, selection } = view.state;
      const { dispatch } = view;

      if (!tableButtonState.isPressed) return;

      const {
        tableCellDimensions,
        startCoords,
        grabbedIndex,
        tableButtonType,
        tableBlockMap,
        tableBlockDOM,
        tableBlockRect,
        tableBlockStart,
      } = tableButtonState;

      mouseX = e.clientX;

      const distance =
        Math.pow(e.clientX - startCoords.x, 2) +
        Math.pow(e.clientY - startCoords.y, 2);

      if (distance > 25) tableButtonState.isReordering = true;

      if (!tableButtonState.isReordering) return;

      // reordering has initiated

      if (!tableButtonState.clonedDOM) {
        // clone once
        // fix
        // fix
        // fix
        tableButtonState.clonedDOM =
          tableButtonType === "column"
            ? cloneColumn(e, grabbedIndex, tableBlockDOM)
            : cloneRow(e, grabbedIndex, tableBlockDOM);

        // hide cells once
        const hiddenCells = [];

        selection.forEachCell((node, pos) => {
          hiddenCells.push({ from: pos, to: pos + node.nodeSize });
        });

        tr.setMeta(REORDER_HIDE_CELLS, hiddenCells);

        dispatch(tr);
      }

      const { x, y, width, height } = tableBlockRect;
      const tableWrapper = tableBlockDOM.querySelector(".tableWrapper");

      // movement of the clonedDOM
      // fix
      // fix
      // fix
      if (tableButtonType === "column") {
        const minX = x + 30;
        const maxX = x + width - 30;
        const clampedX = Math.max(minX, Math.min(e.clientX, maxX));

        tableButtonState.clonedDOM.style.display = "flex";
        tableButtonState.clonedDOM.style.top = y + window.scrollY + 2 + "px";
        tableButtonState.clonedDOM.style.left = clampedX + "px";
        tableButtonState.clonedDOM.style.transform = `translateX(-${tableButtonState.clonedDOM.offsetWidth / 2}px)`;
      }

      // movement of the clonedDOM
      if (tableButtonType === "row") {
        const minY = y - 10;
        const maxY = y + height - tableButtonState.clonedDOM.offsetHeight + 10;
        const clampedY = Math.max(minY, Math.min(e.clientY, maxY));

        tableButtonState.clonedDOM.style.display = "flex";
        tableButtonState.clonedDOM.style.top =
          clampedY + 2 + window.scrollY + "px";
        tableButtonState.clonedDOM.style.left = x + "px";
      }

      for (let i = 0; i < tableCellDimensions.length; i++) {
        const { startCoord, endCoord, index } = tableCellDimensions[i];

        const mouseCoord =
          tableButtonType === "column"
            ? e.clientX + tableWrapper.scrollLeft
            : e.clientY;

        const isValidTarget =
          (mouseCoord >= startCoord && mouseCoord <= endCoord) ||
          (index === 0 && mouseCoord <= startCoord) ||
          (index === tableCellDimensions.length - 1 && mouseCoord >= endCoord);

        if (isValidTarget && index !== grabbedIndex) {
          tableButtonState.targetIndex = index;

          const hoveredCells =
            tableButtonType === "column"
              ? getHoveredCells_COLUMN(
                  view,
                  tableBlockMap,
                  tableBlockStart,
                  grabbedIndex,
                  index
                )
              : getHoveredCells_ROW(
                  view,
                  tableBlockMap,
                  tableBlockStart,
                  grabbedIndex,
                  index
                );

          tr.setMeta(REORDER_HOVERED_CELLS, hoveredCells);

          dispatch(tr);

          break;
        } else {
          tableButtonState.targetIndex = null;

          tr.setMeta(REORDER_HOVERED_CELLS, null);

          dispatch(tr);
        }
      }
    };

    const handleMouseUp = () => {
      const { tr } = view.state;
      const { dispatch } = view;

      clearInterval(scrollIntervalID);

      const {
        isPressed,
        isReordering,
        grabbedIndex,
        targetIndex,
        tableButtonType,
      } = tableButtonState;

      if (isPressed) {
        if (!isReordering) {
          const rect = tableButtonState.tableButtonDOM.getBoundingClientRect();

          tr.setMeta("open-table-dropdown", {
            isOpen: true,
            rect,
            type: tableButtonState.tableButtonType,
          });

          dispatch(tr);
        }

        if (
          isReordering &&
          targetIndex !== null &&
          grabbedIndex !== targetIndex
        ) {
          if (tableButtonType === "column") {
            // moveTableColumn({
            //   from: grabbedIndex,
            //   to: targetIndex,
            // })(view.state, (tr) => {
            //   // remove hovered cells and hide cells decoration
            //   tr
            //     //
            //     .setMeta(REORDER_HIDE_CELLS, null)
            //     .setMeta(REORDER_HOVERED_CELLS, null);
            //   dispatch(tr);
            // });

            tr
              //
              .setMeta(REORDER_HIDE_CELLS, null)
              .setMeta(REORDER_HOVERED_CELLS, null);

            dispatch(tr);
          }

          if (tableButtonType === "row") {
            moveTableRow({
              from: grabbedIndex,
              to: targetIndex,
            })(view.state, (tr) => {
              // remove hovered cells and hide cells decoration
              tr
                //
                .setMeta(REORDER_HIDE_CELLS, null)
                .setMeta(REORDER_HOVERED_CELLS, null);

              dispatch(tr);
            });
          }
        } else {
          // remove hovered cells and hide cells decoration
          tr
            //
            .setMeta(REORDER_HIDE_CELLS, null)
            .setMeta(REORDER_HOVERED_CELLS, null);

          dispatch(tr);
        }

        tableButtonState.isPressed = false;
        tableButtonState.isReordering = false;

        tableButtonState.tableCellDimensions = null;
        tableButtonState.clonedDOM?.remove();
        tableButtonState.clonedDOM = null;

        tableButtonState.startCoords = null;
        tableButtonState.grabbedIndex = null;
        tableButtonState.targetIndex = null;
        tableButtonState.tableButtonType = null;

        tableButtonState.tableButtonDOM = null;

        tableButtonState.tableBlockMap = null;
        tableButtonState.tableBlockDOM = null;
        tableButtonState.tableBlockRect = null;
        tableButtonState.tableBlockNode = null;
        tableButtonState.tableBlockStart = null;
      }
    };

    view.dom.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return {
      destroy() {
        view.dom.removeEventListener("mousedown", handleMouseDown);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      },
    };
  },
});
