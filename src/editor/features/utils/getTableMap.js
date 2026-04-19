export const getTableMap = (tableNode, tableBefore) => {
  const rows = [];
  const grid = [];

  let rowIndex = null;

  tableNode.descendants((node, pos, parent, index) => {
    const nodePos = tableBefore + pos + 1;

    const type = node.firstChild.type.name || "tableCell";

    if (node.type.name === "tableRow") {
      const row = {
        type,
        pos: nodePos,
        node,
      };

      rows.push(row);

      rowIndex = index;
    }

    if (node.type.name === "tableHeader" || node.type.name === "tableCell") {
      const cell = {
        type: node.type.name || "tableCell",
        pos: nodePos,
        node,
      };

      const row = grid[rowIndex];

      if (!row) {
        grid.push([cell]);
      } else {
        row.push(cell);
      }

      return false;
    }
  });

  return { rows, grid };
};
