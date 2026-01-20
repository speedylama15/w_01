import { getTableControls } from "./getTableControls";

export const displayTextSelectedTableControls = (view, tableID, pos) => {
  // get the individual cellDOM
  const cellDOM = view.nodeDOM(pos);

  if (!cellDOM) return;

  const {
    offsetLeft: x,
    offsetTop: y,
    offsetWidth: width,
    offsetHeight: height,
  } = cellDOM;

  const { rowButton, columnButton, selectionBox, cellButton } =
    getTableControls(tableID);

  selectionBox.style.cssText = `
    display: flex;
    top: ${y}px;
    left: ${x}px;
    width: ${width}px;
    height: ${height}px;
  `;

  cellButton.style.cssText = `
    display: flex;
  `;

  columnButton.setAttribute("data-from-index", cellDOM.cellIndex);
  columnButton.style.cssText = `
    display: flex;
    top: 0;
    left: ${x + width / 2}px;
  `;

  rowButton.setAttribute("data-from-index", cellDOM.parentElement.rowIndex);
  rowButton.style.cssText = `
    display: flex;
    top: ${y + height / 2}px;
    left: -1px;
  `;
};
