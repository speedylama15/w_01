import { getTableControls } from "./getTableControls";

export const hideTableControls = (nodeID) => {
  const { selectionBox, columnButton, rowButton } = getTableControls(nodeID);

  selectionBox.style.display = "none";
  columnButton.style.display = "none";
  rowButton.style.display = "none";
};
