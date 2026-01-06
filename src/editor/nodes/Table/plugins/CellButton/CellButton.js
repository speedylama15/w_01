import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import { CellSelection, TableMap, moveTableColumn } from "@tiptap/pm/tables";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

const REORDER_HIDE_CELLS = "REORDER_HIDE_CELLS";
const REORDER_HOVERED_CELLS = "REORDER_HOVERED_CELLS";

// HIDE_DROPDOWN
// SHOW_DROPDOWN

// todo: column -> offsetWidth row -> offsetHeight
// todo: change startX to something that works for both startXY
const getTableCellDimensions = (initX, tableBlockDOM, buttonType) => {
  let startX = initX;

  const cells = Array.from(tableBlockDOM.querySelector("tr").children);

  const cellDimensions = cells.map((cell) => {
    const { cellIndex } = cell;

    const start = startX;
    const end = start + cell.offsetWidth;

    startX = end;

    return {
      startX: start,
      endX: end,
      cellIndex,
    };
  });

  return cellDimensions;
};

const cloneColumn = (e, index, tableBlockDOM) => {
  try {
    const tableWrapper = document.createElement("div");
    tableWrapper.style.position = "relative";

    const table = document.createElement("table");

    const colgroup = document.createElement("colgroup");
    const col = tableBlockDOM
      ?.querySelector("colgroup")
      ?.children[index]?.cloneNode(true);
    colgroup.append(col);

    const tbody = document.createElement("tbody");
    const rows = Array.from(tableBlockDOM.querySelector("tbody").children);
    rows.forEach((tr) => {
      const cell = tr.children[index];

      if (cell) {
        const clonedTr = tr.cloneNode(false);
        clonedTr.append(cell.cloneNode(true));
        tbody.append(clonedTr);
      }
    });

    const tableSelectionBox = tableBlockDOM
      .querySelector(".table-selection-box")
      .cloneNode(true);
    tableSelectionBox.style.top = 0;
    tableSelectionBox.style.left = 0;

    tableWrapper.append(table, tableSelectionBox);
    table.append(colgroup, tbody);

    tableWrapper.style.display = "none";
    tableWrapper.style.width = parseInt(col.style.width) + 1 + "px";
    tableWrapper.style.position = "absolute";
    tableWrapper.style.zIndex = 100;
    tableWrapper.style.opacity = "0.5";

    document.body.appendChild(tableWrapper);

    return tableWrapper;
  } catch (error) {
    console.log(error);
  }
};

const getHoveredCells = (
  view,
  tableMap,
  tableStart,
  grabbedIndex,
  hoveredCellIndex
) => {
  let nodes = [];

  for (let row = 0; row < tableMap.height; row++) {
    const indexInMap = row * tableMap.width + hoveredCellIndex;
    const cellPos = tableStart + tableMap.map[indexInMap];
    const cellNode = view.state.doc.nodeAt(cellPos);

    if (!cellNode) {
      nodes = [];
      break;
    } else {
      nodes.push({
        from: cellPos,
        to: cellPos + cellNode.nodeSize,
        direction: grabbedIndex > hoveredCellIndex ? "left" : "right",
      });
    }
  }

  return nodes;
};

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

    apply(tr, value, oldState, newState) {
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
      buttonType: null, // row or column

      tableBlockMap: null,
      tableBlockDOM: null,
      tableBlockRect: null,
      tableBlockNode: null,
      tableBlockStart: null,
    };

    const handleMouseDown = (e) => {
      const { tr } = view.state;
      const { dispatch } = view;

      const tableButton = e.target.closest(".table-button");
      if (!tableButton) return;

      const tableBlockDOM = e.target.closest(`div[data-content-type="table"]`);
      if (!tableBlockDOM) return;

      e.preventDefault();
      e.stopPropagation(); // todo: figure out the different mousedown event handlers

      const buttonType = tableButton.dataset.tableButtonType;
      const buttonIndex = parseInt(tableButton.dataset.tableButtonIndex);

      const tableBlockStart = view.posAtDOM(tableBlockDOM);
      const tableBlockBefore = tableBlockStart - 1;
      const tableBlockNode = view.state.doc.nodeAt(tableBlockBefore); // to get tableMap
      const tableBlockMap = TableMap.get(tableBlockNode); // to get the col/row selection

      if (buttonType === "column") {
        const cellPos = tableBlockStart + tableBlockMap.map[buttonIndex];
        const $cell = view.state.doc.resolve(cellPos);
        const colSelection = CellSelection.colSelection($cell); // get the col selection

        const tableBlockRect = tableBlockDOM.getBoundingClientRect();
        // fix: orientation needs to be taken into account
        const tableCellDimensions = getTableCellDimensions(
          tableBlockRect.x,
          tableBlockDOM,
          buttonType
        );

        tableButtonState.isPressed = true;

        tableButtonState.tableCellDimensions = tableCellDimensions;

        tableButtonState.startCoords = { x: e.clientX, y: e.clientY };
        tableButtonState.grabbedIndex = buttonIndex;
        tableButtonState.buttonType = buttonType;

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

      // gotta work with row as well
    };

    const handleMouseMove = (e) => {
      const { tr, selection } = view.state;
      const { dispatch } = view;

      if (!tableButtonState.isPressed) return;

      const {
        tableCellDimensions,
        startCoords,
        grabbedIndex,
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
        // fix: either column or row, but rn let's just go with column
        // clone once
        tableButtonState.clonedDOM = cloneColumn(
          e,
          grabbedIndex,
          tableBlockDOM
        );

        // hide cells once
        const hiddenCells = [];

        selection.forEachCell((node, pos) => {
          hiddenCells.push({ from: pos, to: pos + node.nodeSize });
        });

        tr.setMeta(REORDER_HIDE_CELLS, hiddenCells);

        dispatch(tr);
      }

      const { x, y, width } = tableBlockRect;
      const tableWrapper = tableBlockDOM.querySelector(".tableWrapper");

      const minX = x + 30;
      const maxX = x + width - 30;
      const clampedX = Math.max(minX, Math.min(e.clientX, maxX));

      tableButtonState.clonedDOM.style.display = "flex";
      tableButtonState.clonedDOM.style.top = y + "px";
      tableButtonState.clonedDOM.style.left = clampedX + "px";
      tableButtonState.clonedDOM.style.transform = `translateX(-${tableButtonState.clonedDOM.offsetWidth / 2}px)`;

      for (let i = 0; i < tableCellDimensions.length; i++) {
        const { startX, endX, cellIndex } = tableCellDimensions[i]; // fix: adjust the names

        const mouseX = e.clientX + tableWrapper.scrollLeft;

        const isValidTarget =
          (mouseX >= startX && mouseX <= endX) ||
          (cellIndex === 0 && mouseX <= startX) ||
          (cellIndex === tableCellDimensions.length - 1 && mouseX >= endX);

        if (isValidTarget && cellIndex !== grabbedIndex) {
          tableButtonState.targetIndex = cellIndex;

          const hoveredCells = getHoveredCells(
            view,
            tableBlockMap,
            tableBlockStart,
            grabbedIndex,
            cellIndex
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

    const handleMouseUp = (e) => {
      const { tr } = view.state;
      const { dispatch } = view;

      clearInterval(scrollIntervalID);

      const { isPressed, isReordering, grabbedIndex, targetIndex } =
        tableButtonState;

      if (isPressed) {
        if (
          isReordering &&
          targetIndex !== null &&
          grabbedIndex !== targetIndex
        ) {
          moveTableColumn({
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
        tableButtonState.buttonType = null;

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
