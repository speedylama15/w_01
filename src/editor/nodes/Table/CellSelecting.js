import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import { CellSelection, TableMap, moveTableColumn } from "@tiptap/pm/tables";
import { columnResizingPluginKey } from "prosemirror-tables";

import { getDepth } from "../../utils/getDepth";
import { getDepthByContent } from "../../utils/getDepthByContent";

const getTableControls = (nodeID) => {
  const tableBlockDOM = document.querySelector(`div[data-id="${nodeID}"]`);

  const selectionBox = tableBlockDOM.querySelector(".table-selection-box");
  const columnButton = tableBlockDOM.querySelector(".table-column-button");
  const rowButton = tableBlockDOM.querySelector(".table-row-button");

  return { selectionBox, columnButton, rowButton };
};

const hideTableControls = (nodeID) => {
  const { selectionBox, columnButton, rowButton } = getTableControls(nodeID);

  selectionBox.style.display = "none";
  columnButton.style.display = "none";
  rowButton.style.display = "none";
};

const displayTextSelectedTableControls = (view, nodeID, pos) => {
  const cellDOM = view.nodeDOM(pos);

  if (!cellDOM) return;

  const {
    offsetLeft: x,
    offsetTop: y,
    offsetWidth: width,
    offsetHeight: height,
  } = cellDOM;

  const { selectionBox, columnButton, rowButton } = getTableControls(nodeID);

  let gap = 0;

  selectionBox.style.display = "flex";
  selectionBox.style.top = y + gap + "px";
  selectionBox.style.left = x + gap + "px";
  selectionBox.style.width = width + "px";
  selectionBox.style.height = height + "px";

  columnButton.style.display = "flex";
  columnButton.style.top = gap + "px";
  columnButton.style.left =
    cellDOM.offsetLeft + cellDOM.offsetWidth / 2 + gap + "px";
  columnButton.setAttribute("data-table-button-index", cellDOM.cellIndex);

  rowButton.style.display = "flex";
  rowButton.style.top =
    cellDOM.offsetTop + cellDOM.offsetHeight / 2 + gap + "px";
  rowButton.style.left = gap + "px";
  rowButton.setAttribute(
    "data-table-button-index",
    cellDOM.parentElement.rowIndex
  );
};

const displayCellSelectedTableControls = (view, nodeID) => {
  const { selection } = view.state;

  const { $anchorCell, $headCell } = selection;

  const anchorDOM = view.nodeDOM($anchorCell.pos);
  const headDOM = view.nodeDOM($headCell.pos);

  const { selectionBox, columnButton, rowButton } = getTableControls(nodeID);

  const x = Math.min(anchorDOM.offsetLeft, headDOM.offsetLeft);
  const y = Math.min(anchorDOM.offsetTop, headDOM.offsetTop);
  const r = Math.max(
    anchorDOM.offsetLeft + anchorDOM.offsetWidth,
    headDOM.offsetLeft + headDOM.offsetWidth
  );
  const b = Math.max(
    anchorDOM.offsetTop + anchorDOM.offsetHeight,
    headDOM.offsetTop + headDOM.offsetHeight
  );
  const width = r - x;
  const height = b - y;

  let gap = 0;

  selectionBox.style.display = "flex";
  selectionBox.style.top = y + gap + "px";
  selectionBox.style.left = x + gap + "px";
  selectionBox.style.width = width + "px";
  selectionBox.style.height = height + "px";

  columnButton.style.display = "flex";
  columnButton.style.top = gap + "px";
  columnButton.style.left =
    headDOM.offsetLeft + headDOM.offsetWidth / 2 + gap + "px";
  columnButton.setAttribute("data-table-button-index", headDOM.cellIndex);

  rowButton.style.display = "flex";
  rowButton.style.top =
    headDOM.offsetTop + headDOM.offsetHeight / 2 + gap + "px";
  rowButton.style.left = gap + "px";
  rowButton.setAttribute(
    "data-table-button-index",
    headDOM.parentElement.rowIndex
  );
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
    Array.from(tableBlockDOM.querySelector("tbody").children).forEach((tr) => {
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

    tableWrapper.style.display = "none"; // fix
    tableWrapper.style.position = "absolute";
    tableWrapper.style.zIndex = 10000; // fix
    tableWrapper.style.opacity = "0.5";
    tableWrapper.style.width = parseInt(col.style.width) + 1 + "px"; // fix

    document.body.appendChild(tableWrapper);

    return tableWrapper;
  } catch (error) {
    console.log(error);
  }
};

export const CellSelectingKey = new PluginKey("CellSelectingKey");

export const CellSelecting = new Plugin({
  key: CellSelectingKey,

  state: {
    init() {
      return {
        isReordering: false,
        isReordered: false,
        index: null,
        targetIndex: null,
        orientation: null, // column or row
      };
    },

    apply(tr, value, oldState, newState) {
      const tableReorder = tr.getMeta("table-reorder");

      if (tableReorder) return tableReorder;

      return value;
    },
  },

  view(editorView) {
    // review: values to use
    let scrollInterval = null;
    let mouseX = 0;

    const tableReorderState = {
      cellDimensions: null,
      cloneDOM: null,
      tableBlockDOM: null,
      tableBlockRect: null,
      isPressedTableButton: false,
      isReordering: false,
      startCoords: null,
      sourceIndex: null,
      targetIndex: null,
      buttonOrientation: null,
      scrollAnimationId: null,
    };
    // review

    const handleMouseDown = (e) => {
      const { tr } = editorView.state;
      const { dispatch } = editorView;

      const tableButton = e.target.closest(".table-button");

      if (tableButton) {
        // idea: perhaps I could improve this?
        // idea: table button has the ID of the block node
        // idea: query for content-type="table" && the id
        const tableBlockDOM = e.target.closest(
          `div[data-content-type="table"]`
        );

        if (!tableBlockDOM) return;

        e.preventDefault();
        e.stopPropagation(); // todo: I need to figure out the hierarchy of mousedowns

        const type = tableButton.dataset.tableButtonType; // fix: change name to tableButtonOrientation
        const sourceIndex = parseInt(tableButton.dataset.tableButtonIndex);

        const tableStart = editorView.posAtDOM(tableBlockDOM);
        const tableBefore = tableStart - 1;
        const tableNode = editorView.state.doc.nodeAt(tableBefore); // to get the map
        const tableMap = TableMap.get(tableNode); // to get the col/row selection

        if (type === "column") {
          const cellPos = tableStart + tableMap.map[sourceIndex];
          const $cell = editorView.state.doc.resolve(cellPos);
          const colSelection = CellSelection.colSelection($cell);

          // todo: dnd
          const rect = tableBlockDOM.getBoundingClientRect(); // fix
          let startX = rect.x;

          const cellDimensions = Array.from(
            tableBlockDOM.querySelector("tr").children
          ).map((cell) => {
            const cellIndex = cell.cellIndex;

            const start = startX;
            const end = start + cell.offsetWidth;

            startX = end;

            return {
              cellIndex,
              startX: start,
              endX: end,
            };
          });

          tableReorderState.cellDimensions = cellDimensions;
          tableReorderState.tableBlockDOM = tableBlockDOM;
          tableReorderState.tableBlockRect =
            tableBlockDOM.getBoundingClientRect(); // can do this because the DOM element exists already
          tableReorderState.isPressedTableButton = true;
          tableReorderState.startCoords = { x: e.clientX, y: e.clientY };
          tableReorderState.sourceIndex = sourceIndex;

          tr.setSelection(colSelection);
          dispatch(tr);

          const tableWrapper = tableBlockDOM.querySelector(".tableWrapper");

          scrollInterval = setInterval(() => {
            const rect = tableWrapper.getBoundingClientRect();

            if (mouseX < rect.left) {
              tableWrapper.scrollLeft -= 5;
            } else if (mouseX > rect.right) {
              tableWrapper.scrollLeft += 5;
            }
          }, 16);
          // todo

          return;
        }

        // if (type === "row") {
        //   const cellPos =
        //     tableStart + tableMap.map[tableMap.width * sourceIndex];

        //   const $cell = editorView.state.doc.resolve(cellPos);
        //   const rowSelection = CellSelection.rowSelection($cell);

        //   tr.setSelection(rowSelection).setMeta("tableDropdown", {
        //     isOpen: true,
        //     buttonType: type,
        //     buttonIndex: sourceIndex,
        //     buttonRect: tableButton.getBoundingClientRect(),
        //   });

        //   dispatch(tr);

        //   return;
        // }
      }
    };

    const handleMouseMove = (e) => {
      if (tableReorderState.isPressedTableButton) {
        mouseX = e.clientX;

        const distance =
          Math.pow(e.clientX - tableReorderState.startCoords.x, 2) +
          Math.pow(e.clientY - tableReorderState.startCoords.y, 2);

        if (distance > 25) tableReorderState.isReordering = true;

        if (tableReorderState.isReordering) {
          if (!tableReorderState.cloneDOM) {
            const cloneDOM = cloneColumn(
              e,
              tableReorderState.sourceIndex,
              tableReorderState.tableBlockDOM
            );

            tableReorderState.cloneDOM = cloneDOM;
          } else {
            const { tableBlockDOM, tableBlockRect, cloneDOM, sourceIndex } =
              tableReorderState;
            const { x, y, width } = tableBlockRect;

            const tableWrapper = tableBlockDOM.querySelector(".tableWrapper");

            const minX = x + 30;
            const maxX = x + width - 30;
            const clampedX = Math.max(minX, Math.min(e.clientX, maxX));

            cloneDOM.style.display = "flex";
            cloneDOM.style.top = y + "px";
            cloneDOM.style.left = clampedX + "px";
            cloneDOM.style.transform = `translateX(-${cloneDOM.offsetWidth / 2}px)`;

            for (let i = 0; i < tableReorderState.cellDimensions.length; i++) {
              const { startX, endX, cellIndex } =
                tableReorderState.cellDimensions[i];

              const mouseX = e.clientX + tableWrapper.scrollLeft;

              if (
                mouseX > startX &&
                mouseX < endX &&
                cellIndex !== sourceIndex
              ) {
                tableReorderState.targetIndex = cellIndex;

                break;
              } else if (
                cellIndex === 0 &&
                mouseX < endX &&
                cellIndex !== sourceIndex
              ) {
                tableReorderState.targetIndex = cellIndex;

                break;
              } else if (
                cellIndex === tableReorderState.cellDimensions.length - 1 &&
                mouseX > startX &&
                cellIndex !== sourceIndex
              ) {
                tableReorderState.targetIndex = cellIndex;

                break;
              } else {
                tableReorderState.targetIndex = null;
              }
            }
          }
        }
      }
    };

    const handleMouseUp = () => {
      clearInterval(scrollInterval);

      if (tableReorderState.isPressedTableButton) {
        if (
          tableReorderState.isReordering &&
          tableReorderState.targetIndex !== null &&
          tableReorderState.sourceIndex !== tableReorderState.targetIndex
        ) {
          moveTableColumn({
            from: tableReorderState.sourceIndex,
            to: tableReorderState.targetIndex,
          })(editorView.state, editorView.dispatch);
        }

        // todo: reset
        tableReorderState.isPressedTableButton = false;
        tableReorderState.isReordering = false;
        tableReorderState.startCoords = null;
        tableReorderState.sourceIndex = null;
        tableReorderState.targetIndex = null;

        tableReorderState.cloneDOM?.remove();
        tableReorderState.cloneDOM = null;
        // todo: reset
      }
    };

    editorView.dom.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    // need to know the tableID in which displayed the overlay
    // query for the blockTableDOM and hide the overlay
    let prevTableID = null;

    return {
      update(view) {
        const resizeState = columnResizingPluginKey.getState(view.state); // idea: make use of this

        if (resizeState?.dragging && prevTableID) {
          hideTableControls(prevTableID);
          return;
        }

        const { selection } = view.state;
        const { $from } = selection;

        // pretty much guaranteed that a table will exist
        if (selection instanceof CellSelection) {
          const tableDepth = getDepthByContent($from, "table");
          const tableNode = $from.node(tableDepth);

          if (tableNode.type.name !== "table") return;

          // this cannot be null
          const currTableID = tableNode.attrs.id;

          // prev = "a" curr = "b"
          if (prevTableID !== null && prevTableID !== currTableID) {
            // destroy prev table
            // set prevTableID to currTableID
            // render curr table overlay
            hideTableControls(prevTableID);
            prevTableID = currTableID;
            displayCellSelectedTableControls(view, currTableID);
            return;
          }

          // prev = null curr = "a"
          if (prevTableID === null && prevTableID !== currTableID) {
            // set prevTableID = currID
            // render table A's overlay
            prevTableID = currTableID;
            displayCellSelectedTableControls(view, currTableID);
            return;
          }

          // prev = "a" curr = "a"
          if (prevTableID === currTableID) {
            // set prevTableID = currID
            // render table A's overlay
            prevTableID = currTableID;
            displayCellSelectedTableControls(view, currTableID);
            return;
          }

          return;
        }

        if (selection instanceof TextSelection) {
          const tableDepth = getDepthByContent($from, "table");
          const tableNode = $from.node(tableDepth);
          const cellDepth =
            getDepth($from, "tableCell") || getDepth($from, "tableHeader");

          if (tableNode.type.name !== "table") {
            const currTableID = null;

            // prev = "a" curr = null
            // set prevTableID = null
            // destroy table A's overlay
            if (prevTableID !== null) {
              hideTableControls(prevTableID);
              prevTableID = currTableID;
              return;
            }

            // prev = null curr = null
            // set prevTableID = null
            if (prevTableID === null) {
              prevTableID = currTableID;
              return;
            }
          }

          const currTableID = tableNode.attrs.id;
          const cellBefore = $from.before(cellDepth);

          // prev = "a" curr = "b"
          if (prevTableID !== null && prevTableID !== currTableID) {
            // destroy prev table
            // set prevTableID to currTableID
            // render curr table overlay
            hideTableControls(prevTableID);
            prevTableID = currTableID;
            displayTextSelectedTableControls(view, currTableID, cellBefore);
            return;
          }

          // prev = null curr = "a"
          if (prevTableID === null && prevTableID !== currTableID) {
            // set prevTableID = currID
            // render table A's overlay
            prevTableID = currTableID;
            displayTextSelectedTableControls(view, currTableID, cellBefore);
            return;
          }

          // prev = "a" curr = "a"
          if (prevTableID === currTableID) {
            // set prevTableID = currID
            // render table A's overlay
            prevTableID = currTableID;
            displayTextSelectedTableControls(view, currTableID, cellBefore);
            return;
          }

          return;
        }
      },

      destroy() {
        editorView.dom.removeEventListener("mousedown", handleMouseDown);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      },
    };
  },
});
