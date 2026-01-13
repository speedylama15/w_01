import { getTableBlockDOM } from "./getTableBlockDOM";

export const getTableControls = (tableID) => {
  const tableBlockDOM = getTableBlockDOM(tableID);

  const contentWrapper = tableBlockDOM.querySelector(".contentWrapper");

  const rowButton = contentWrapper.querySelector(".table-row-button");
  const columnButton = contentWrapper.querySelector(".table-column-button");
  const selectionBox = contentWrapper.querySelector(".table-selection-box");
  const cellButton = contentWrapper.querySelector(".table-cell-button");

  return { rowButton, columnButton, selectionBox, cellButton };
};
