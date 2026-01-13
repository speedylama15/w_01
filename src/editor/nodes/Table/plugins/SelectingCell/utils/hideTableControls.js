import { getTableControls } from "./getTableControls";

export const hideTableControls = (tableID) => {
  const { rowButton, columnButton, selectionBox, cellButton } =
    getTableControls(tableID);

  rowButton.style.display = "none";

  columnButton.style.display = "none";

  selectionBox.style.display = "none";
  cellButton.style.display = "none";
};
