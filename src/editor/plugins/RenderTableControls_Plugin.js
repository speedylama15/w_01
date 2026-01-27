import { Plugin, TextSelection } from "@tiptap/pm/state";
import { CellSelection } from "@tiptap/pm/tables";

import { getDepthByContentType } from "../utils/depth/getDepthByContentType";
import { getDepthByNodeType } from "../utils/depth/getDepthByNodeType";

export const RenderTableControls_Plugin = new Plugin({
  view() {
    return {
      update(view, prevState) {
        let currTableID = null;

        const currSelection = view.state.selection;
        const prevSelection = prevState.selection;

        if (currSelection instanceof TextSelection) {
          // obtain the table first
          const tableResult = getDepthByNodeType(currSelection.$from, "block");

          // do something (render) when it's a table
          if (tableResult?.node.type.name === "table") {
            const tableBefore = currSelection.$from.before(tableResult.depth);
            // obtain tableDOM
            const tableDOM = view.nodeDOM(tableBefore);
            // get ID
            const tableID = tableDOM.getAttribute("data-id");

            currTableID = tableID;

            // get the controls
            const selectionBox = tableDOM.querySelector(".table-selection-box");
            const cellButton = selectionBox.querySelector(".table-cell-button");
            const columnButton = tableDOM.querySelector(".table-column-button");
            const rowButton = tableDOM.querySelector(".table-row-button");

            const cellResult =
              getDepthByContentType(currSelection.$from, "tableCell") ||
              getDepthByContentType(currSelection.$from, "tableHeader");

            const cellBefore = currSelection.$from.before(cellResult.depth);
            // get cellDOM
            const cellDOM = view.nodeDOM(cellBefore);

            selectionBox.style.cssText = `
              display: flex;
              top: ${cellDOM.offsetTop}px;
              left: ${cellDOM.offsetLeft}px;
              width: ${cellDOM.offsetWidth}px;
              height: ${cellDOM.offsetHeight}px;
            `;

            cellButton.style.cssText = `
              display: flex;
            `;

            columnButton.setAttribute("data-from-index", cellDOM.cellIndex);
            columnButton.style.cssText = `
              display: flex;
              top: 0;
              left: ${cellDOM.offsetLeft + cellDOM.offsetWidth / 2}px;
            `;

            rowButton.setAttribute(
              "data-from-index",
              cellDOM.parentElement.rowIndex,
            );
            rowButton.style.cssText = `
              display: flex;
              top: ${cellDOM.offsetTop + cellDOM.offsetHeight / 2}px;
              left: -1px;
            `;
          }
        }

        if (currSelection instanceof CellSelection) {
          const tableNode = currSelection.$anchorCell.node(-1);

          if (!tableNode) return;

          const tableID = tableNode.attrs.id;

          currTableID = tableID;

          const tableBefore = currSelection.$anchorCell.start(-1) - 1;
          const tableDOM = view.nodeDOM(tableBefore);

          const selectionBox = tableDOM.querySelector(".table-selection-box");
          const cellButton = selectionBox.querySelector(".table-cell-button");
          const columnButton = tableDOM.querySelector(".table-column-button");
          const rowButton = tableDOM.querySelector(".table-row-button");

          const anchorDOM = view.nodeDOM(currSelection.$anchorCell.pos);
          const headDOM = view.nodeDOM(currSelection.$headCell.pos);

          const top = Math.min(anchorDOM.offsetTop, headDOM.offsetTop);
          const left = Math.min(anchorDOM.offsetLeft, headDOM.offsetLeft);
          const bottom = Math.max(
            anchorDOM.offsetTop + anchorDOM.offsetHeight,
            headDOM.offsetTop + headDOM.offsetHeight,
          );
          const right = Math.max(
            anchorDOM.offsetLeft + anchorDOM.offsetWidth,
            headDOM.offsetLeft + headDOM.offsetWidth,
          );

          const width = right - left;
          const height = bottom - top;

          selectionBox.style.cssText = `
            position: absolute;
            display: flex;
            top: ${top}px;
            left: ${left}px;
            width: ${width}px;
            height: ${height}px;
          `;

          cellButton.style.cssText = `
            display: none;
          `;

          columnButton.setAttribute("data-from-index", headDOM.cellIndex);
          columnButton.style.cssText = `
            display: flex;
            top: 0;
            left: ${headDOM.offsetLeft + headDOM.offsetWidth / 2}px;
          `;

          rowButton.setAttribute(
            "data-from-index",
            headDOM.parentElement.rowIndex,
          );
          rowButton.style.cssText = `
            display: flex;
            top: ${headDOM.offsetTop + headDOM.offsetHeight / 2}px;
            left: -1px;
          `;
        }

        if (prevSelection instanceof TextSelection) {
          const tableResult = getDepthByNodeType(prevSelection.$from, "block");

          // hide when block is a table AND the ids differ
          if (
            tableResult?.node.type.name === "table" &&
            tableResult?.node.attrs.id !== currTableID
          ) {
            const tableBefore = prevSelection.$from.before(tableResult.depth);
            // obtain tableDOM
            const tableDOM = view.nodeDOM(tableBefore);

            // get the controls
            const selectionBox = tableDOM.querySelector(".table-selection-box");
            const cellButton = selectionBox.querySelector(".table-cell-button");
            const columnButton = tableDOM.querySelector(".table-column-button");
            const rowButton = tableDOM.querySelector(".table-row-button");

            selectionBox.style.display = "none";
            cellButton.style.display = "none";
            columnButton.style.display = "none";
            rowButton.style.display = "none";
          }
        }

        if (prevSelection instanceof CellSelection) {
          const tableNode = prevSelection.$anchorCell.node(-1);

          if (!tableNode) return;

          // hide only when ids differ
          if (tableNode.attrs.id !== currTableID) {
            const tableBefore = prevSelection.$anchorCell.start(-1) - 1;
            const tableDOM = view.nodeDOM(tableBefore);

            const selectionBox = tableDOM.querySelector(".table-selection-box");
            const cellButton = selectionBox.querySelector(".table-cell-button");
            const columnButton = tableDOM.querySelector(".table-column-button");
            const rowButton = tableDOM.querySelector(".table-row-button");

            selectionBox.style.display = "none";
            cellButton.style.display = "none";
            columnButton.style.display = "none";
            rowButton.style.display = "none";
          }
        }
        //
      },
    };
  },
});
