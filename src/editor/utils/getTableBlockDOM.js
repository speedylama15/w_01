export const getTableBlockDOM = (tableID) => {
  const tableBlockDOM = document.querySelector(
    `div[data-id="${tableID}"][data-content-type="table"]`
  );

  return tableBlockDOM;
};
