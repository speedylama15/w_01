export const getTableCellDimensions_ROW = (initCoord, tableBlockDOM) => {
  let startCoord = initCoord;

  const rows = Array.from(tableBlockDOM.querySelectorAll("tr"));

  const cellDimensions = rows.map((row) => {
    const { rowIndex } = row;

    const start = startCoord;
    const end = start + row.offsetHeight;

    startCoord = end;

    return {
      startCoord: start,
      endCoord: end,
      index: rowIndex,
    };
  });

  return cellDimensions;
};
