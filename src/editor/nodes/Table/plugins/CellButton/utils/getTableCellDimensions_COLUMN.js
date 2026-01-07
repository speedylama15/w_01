export const getTableCellDimensions_COLUMN = (initCoord, tableBlockDOM) => {
  let startCoord = initCoord;

  const cells = Array.from(tableBlockDOM.querySelector("tr").children);

  const cellDimensions = cells.map((cell) => {
    const { cellIndex } = cell;

    const start = startCoord;
    const end = start + cell.offsetWidth;

    startCoord = end;

    return {
      startCoord: start,
      endCoord: end,
      index: cellIndex,
    };
  });

  return cellDimensions;
};
