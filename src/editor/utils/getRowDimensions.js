export const getRowDimensions = (initCoord, tableBlockDOM) => {
  let startPoint = initCoord;

  const rows = Array.from(tableBlockDOM.querySelectorAll("tr"));

  const cellDimensions = rows.map((row) => {
    const { rowIndex } = row;

    const start = startPoint;
    const end = start + row.offsetHeight;

    startPoint = end;

    return {
      startPoint: start,
      endPoint: end,
      index: rowIndex,
    };
  });

  return cellDimensions;
};
