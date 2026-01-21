export const getTableMap = (tableNode, tableBefore, tableAfter) => {
  const rowArray = [];
  const cellGrid = [];

  let rowIndex = null;

  tableNode.descendants((node, pos, parent, index) => {
    const nodePos = tableBefore + pos + 1;

    if (node.type.name === "tableRow") {
      const row = {
        tableBefore, // fix: needed?
        tableAfter, // fix: needed?
        tableNode, // fix: needed?
        node,
        pos: nodePos,
      };

      rowArray.push(row);

      rowIndex = index;
    }

    if (node.type.name === "tableHeader" || node.type.name === "tableCell") {
      const cell = {
        type: node.type.name === "tableHeader" ? "header" : "cell",
        tableBefore, // fix: needed?
        tableAfter, // fix: needed?
        tableNode, // fix: needed?
        node,
        pos: nodePos,
      };

      const row = cellGrid[rowIndex];

      if (!row) {
        cellGrid.push([cell]);
      } else {
        row.push(cell);
      }

      return false;
    }
  });

  return { rowArray, cellGrid };
};
