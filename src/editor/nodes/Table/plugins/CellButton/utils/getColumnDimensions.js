export const getColumnDimensions = (initCoord, tableBlockDOM) => {
  let startPoint = initCoord;

  const cells = Array.from(tableBlockDOM.querySelector("tr").children);

  const cellDimensions = cells.map((cell) => {
    const { cellIndex } = cell;

    const start = startPoint;
    const end = start + cell.offsetWidth;

    startPoint = end;

    return {
      startPoint: start,
      endPoint: end,
      index: cellIndex,
    };
  });

  return cellDimensions;
};
