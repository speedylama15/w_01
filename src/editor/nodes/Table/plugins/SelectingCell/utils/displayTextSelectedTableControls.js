import { getTableControls } from "./getTableControls";

export const displayTextSelectedTableControls = (view, nodeID, pos) => {
  const cellDOM = view.nodeDOM(pos);

  if (!cellDOM) return;

  const {
    offsetLeft: x,
    offsetTop: y,
    offsetWidth: width,
    offsetHeight: height,
  } = cellDOM;

  const { selectionBox, columnButton, rowButton } = getTableControls(nodeID);

  selectionBox.style.display = "flex";
  selectionBox.style.top = y + "px";
  selectionBox.style.left = x + "px";
  selectionBox.style.width = width + "px";
  selectionBox.style.height = height + "px";

  columnButton.style.display = "flex";
  columnButton.style.top = "0px";
  columnButton.style.left = cellDOM.offsetLeft + cellDOM.offsetWidth / 2 + "px";
  columnButton.setAttribute("data-table-button-index", cellDOM.cellIndex);

  rowButton.style.display = "flex";
  rowButton.style.top = cellDOM.offsetTop + cellDOM.offsetHeight / 2 + "px";
  rowButton.style.left = "0px";
  rowButton.setAttribute(
    "data-table-button-index",
    cellDOM.parentElement.rowIndex
  );
};
