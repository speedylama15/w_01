export const getHoveredCells_ROW = (
  view,
  tableMap,
  tableStart,
  grabbedIndex,
  hoveredCellIndex
) => {
  let nodes = [];

  for (let column = 0; column < tableMap.width; column++) {
    const indexInMap = column + tableMap.width * hoveredCellIndex;
    const cellPos = tableStart + tableMap.map[indexInMap];
    const cellNode = view.state.doc.nodeAt(cellPos);

    if (!cellNode) {
      nodes = [];
      break;
    } else {
      nodes.push({
        from: cellPos,
        to: cellPos + cellNode.nodeSize,
        direction: grabbedIndex > hoveredCellIndex ? "above" : "below",
      });
    }
  }

  return nodes;
};
