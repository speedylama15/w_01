import { getTableControls } from "./getTableControls";

export const displayCellSelectedTableControls = (view, tableID) => {
  const { selection } = view.state;

  const { $anchorCell, $headCell } = selection;

  const anchorDOM = view.nodeDOM($anchorCell.pos);
  const headDOM = view.nodeDOM($headCell.pos);

  const { rowButton, columnButton, selectionBox, cellButton } =
    getTableControls(tableID);

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

  selectionBox.style.cssText = `
    display: flex;
    top: ${y}px;
    left: ${x}px;
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

  rowButton.setAttribute("data-from-index", headDOM.parentElement.rowIndex);
  rowButton.style.cssText = `
    display: flex;
    top: ${headDOM.offsetTop + headDOM.offsetHeight / 2}px;
    left: -1px;
  `;
};
