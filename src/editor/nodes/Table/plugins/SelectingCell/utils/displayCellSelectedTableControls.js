import { getTableControls } from "./getTableControls";

export const displayCellSelectedTableControls = (view, nodeID) => {
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

  selectionBox.style.display = "flex";
  selectionBox.style.top = y + "px";
  selectionBox.style.left = x + "px";
  selectionBox.style.width = width + "px";
  selectionBox.style.height = height + "px";

  selectionBox.querySelector(".cell-button").style.display = "none";

  columnButton.style.display = "flex";
  columnButton.style.top = "0px";
  columnButton.style.left = headDOM.offsetLeft + headDOM.offsetWidth / 2 + "px";
  columnButton.setAttribute("data-table-button-index", headDOM.cellIndex);

  rowButton.style.display = "flex";
  rowButton.style.top = headDOM.offsetTop + headDOM.offsetHeight / 2 + "px";
  rowButton.style.left = "0px";
  rowButton.setAttribute(
    "data-table-button-index",
    headDOM.parentElement.rowIndex
  );
};
