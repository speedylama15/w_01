const getTableMap = (tableNode, tableBefore) => {
  const rows = [];
  const grid = [];
  const identifiers = {};

  let rowIndex = null;

  tableNode.descendants((node, pos, parent, index) => {
    // this is correct. Checked via tr.doc.descendants
    const before = tableBefore + pos + 1;

    const type = node.firstChild?.type.name || "tableCell";

    if (node.type.name === "tableRow") {
      // const type = node.firstChild?.type.name || "tableCell";

      const row = {
        type,
        pos: before,
        node,
      };

      rows.push(row);

      rowIndex = index;
    }

    if (node.type.name === "tableHeader" || node.type.name === "tableCell") {
      const cell = {
        type: node.type.name || "tableCell",
        pos: before,
        node,
      };

      identifiers[before] = {
        pos: before,
        cellIndex: index,
        rowIndex,
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

  return { rows, grid, identifiers };
};

export default getTableMap;
