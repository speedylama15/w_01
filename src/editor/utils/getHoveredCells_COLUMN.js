export const getHoveredCells_COLUMN = (
  view,
  tableMap,
  tableStart,
  grabbedIndex,
  hoveredCellIndex
) => {
  let nodes = [];

  for (let row = 0; row < tableMap.height; row++) {
    const indexInMap = row * tableMap.width + hoveredCellIndex;
    const cellPos = tableStart + tableMap.map[indexInMap];
    const cellNode = view.state.doc.nodeAt(cellPos);

    if (!cellNode) {
      nodes = [];
      break;
    } else {
      nodes.push({
        from: cellPos,
        to: cellPos + cellNode.nodeSize,
        direction: grabbedIndex > hoveredCellIndex ? "left" : "right",
      });
    }
  }

  return nodes;
};
