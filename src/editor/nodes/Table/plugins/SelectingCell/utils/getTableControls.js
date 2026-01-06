export const getTableControls = (nodeID) => {
  const tableBlockDOM = document.querySelector(
    `div[data-id="${nodeID}"][data-content-type="table"]`
  );

  const selectionBox = tableBlockDOM.querySelector(".table-selection-box");
  const columnButton = tableBlockDOM.querySelector(".table-column-button");
  const rowButton = tableBlockDOM.querySelector(".table-row-button");

  return { selectionBox, columnButton, rowButton };
};
