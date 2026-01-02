import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import { CellSelection, TableMap } from "@tiptap/pm/tables";
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

export const CellSelectingKey = new PluginKey("CellSelectingKey");

export const CellSelecting = new Plugin({
  key: CellSelectingKey,

  props: {
    handleDOMEvents: {
      mousedown(view, e) {
        const { tr } = view.state;
        const { dispatch } = view;

        const tableButton = e.target.closest(".table-button");

        if (!tableButton) return;

        const tableDOM = e.target.closest(`div[data-content-type="table"]`);

        if (!tableDOM) return;

        e.preventDefault();

        const type = tableButton.dataset.tableButtonType;
        const index = parseInt(tableButton.dataset.tableButtonIndex);

        const tableStart = view.posAtDOM(tableDOM);
        const tableBefore = tableStart - 1;
        const tableNode = view.state.doc.nodeAt(tableBefore);
        const tableMap = TableMap.get(tableNode);

        if (type === "column") {
          const cellPos = tableStart + tableMap.map[index];

          const $cell = view.state.doc.resolve(cellPos);
          const colSelection = CellSelection.colSelection($cell);

          tr.setSelection(colSelection);

          dispatch(tr);

          return;
        }

        if (type === "row") {
          const cellPos = tableStart + tableMap.map[tableMap.width * index];

          const $cell = view.state.doc.resolve(cellPos);
          const rowSelection = CellSelection.rowSelection($cell);

          tr.setSelection(rowSelection);

          dispatch(tr);

          return;
        }
      },
    },
  },

  view() {
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
    };
  },
});
