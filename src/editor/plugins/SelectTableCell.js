import { Plugin, TextSelection } from "@tiptap/pm/state";
import { CellSelection } from "@tiptap/pm/tables";

import { getDepthByContentType } from "../utils/depth/getDepthByContentType";
import { getDepthByNodeType } from "../utils/depth/getDepthByNodeType";

const getTableDataFromTextSelection = (view, selection) => {
  const { $from } = selection;

  const tableResult = getDepthByNodeType(selection.$from, "block");

  if (tableResult?.node.type.name !== "table") return { isTable: false };

  const tableBefore = $from.before(tableResult.depth);
  const tableDOM = view.nodeDOM(tableBefore);
  const tableID = tableDOM.getAttribute("data-id");

  const selectionBox = tableDOM.querySelector(".table-selection-box");
  const columnButton = tableDOM.querySelector(".table-column-button");
  const rowButton = tableDOM.querySelector(".table-row-button");

  const cellResult =
    getDepthByContentType($from, "tableCell") ||
    getDepthByContentType($from, "tableHeader");

  const cellBefore = $from.before(cellResult.depth);
  const cellDOM = view.nodeDOM(cellBefore);

  return {
    isTable: true,
    tableID,
    selectionBox,
    cellDOM,
    columnButton,
    rowButton,
  };
};

const getTableDataFromCellSelection = (view, cellSelection) => {
  const tableNode = cellSelection.$anchorCell.node(-1);
  const tableID = tableNode.attrs.id;

  const tableBefore = cellSelection.$anchorCell.start(-1) - 1;
  const tableDOM = view.nodeDOM(tableBefore);

  const selectionBox = tableDOM.querySelector(".table-selection-box");
  const columnButton = tableDOM.querySelector(".table-column-button");
  const rowButton = tableDOM.querySelector(".table-row-button");

  const anchorDOM = view.nodeDOM(cellSelection.$anchorCell.pos);
  const headDOM = view.nodeDOM(cellSelection.$headCell.pos);

  const top = Math.min(anchorDOM.offsetTop, headDOM.offsetTop);
  const left = Math.min(anchorDOM.offsetLeft, headDOM.offsetLeft);
  const bottom = Math.max(
    anchorDOM.offsetTop + anchorDOM.offsetHeight,
    headDOM.offsetTop + headDOM.offsetHeight
  );
  const right = Math.max(
    anchorDOM.offsetLeft + anchorDOM.offsetWidth,
    headDOM.offsetLeft + headDOM.offsetWidth
  );

  const width = right - left;
  const height = bottom - top;

  return {
    isTable: true,
    tableID,
    selectionBox,
    columnButton,
    rowButton,
    top,
    left,
    width,
    height,
  };
};

export const SelectTableCell = new Plugin({
  view() {
    return {
      update(view, prevState) {
        let currTableID = null;

        const currSelection = view.state.selection;

        if (currSelection instanceof TextSelection) {
          const data = getTableDataFromTextSelection(view, currSelection);

          if (data.isTable) {
            const { tableID, selectionBox, cellDOM } = data;

            currTableID = tableID;

            selectionBox.style.cssText = `
                display: flex;
                top: ${cellDOM.offsetTop}px;
                left: ${cellDOM.offsetLeft}px;
                width: ${cellDOM.offsetWidth}px;
                height: ${cellDOM.offsetHeight}px;
            `;
          }
        }

        if (currSelection instanceof CellSelection) {
          const { tableID, selectionBox, top, left, width, height } =
            getTableDataFromCellSelection(view, currSelection);

          currTableID = tableID;

          selectionBox.style.cssText = `
            position: absolute;
            display: flex;
            top: ${top}px;
            left: ${left}px;
            width: ${width}px;
            height: ${height}px;          
          `;
        }

        if (prevState.selection instanceof TextSelection) {
          const prevSelection = prevState.selection;

          const data = getTableDataFromTextSelection(view, prevSelection);

          if (data.isTable) {
            const { tableID, selectionBox } = data;

            if (currTableID !== tableID) selectionBox.style.display = "none";
          }
        }

        if (prevState.selection instanceof CellSelection) {
          const prevSelection = prevState.selection;

          const { tableID, selectionBox } = getTableDataFromCellSelection(
            view,
            prevSelection
          );

          if (currTableID !== tableID) selectionBox.style.display = "none";
        }
        //
      },
    };
  },
});
