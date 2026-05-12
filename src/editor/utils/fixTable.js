import { Fragment } from "@tiptap/pm/model";

import getTableMap from "./getTableMap";

const toTableCell = (tr, schema, cell) => {
  tr.setNodeMarkup(
    tr.mapping.map(cell.pos),
    schema.nodes.tableCell,
    cell.node.attrs,
  );
};

const toTableHeader = (tr, schema, cell) => {
  tr.setNodeMarkup(
    tr.mapping.map(cell.pos),
    schema.nodes.tableHeader,
    cell.node.attrs,
  );
};

const fixTable = (tableNode, tableBefore, tr, schema) => {
  const tableMap = getTableMap(tableNode, tableBefore);
  const { grid } = tableMap;

  let targetRowCount = 0;
  grid.forEach((row) => {
    if (row.length > targetRowCount) targetRowCount = row.length;
  });

  const isHeaderColumn = tableNode.attrs.isHeaderColumn;
  const isHeaderRow = tableNode.attrs.isHeaderRow;

  grid.forEach((row, i) => {
    const rowIndex = i;
    const currRowCount = row.length;
    const fillRowCount = targetRowCount - currRowCount;

    row.forEach((cell, i) => {
      const cellIndex = i;
      const isHeader = cell.type === "tableHeader";

      if (isHeaderColumn) {
        if (cellIndex === 0) {
          if (!isHeader) toTableHeader(tr, schema, cell);
        }

        if (cellIndex !== 0) {
          if (isHeader) toTableCell(tr, schema, cell);
        }
      } else {
        if (isHeader) toTableCell(tr, schema, cell);
      }

      if (isHeaderRow) {
        if (rowIndex === 0) {
          if (!isHeader) toTableHeader(tr, schema, cell);
        }

        if (rowIndex !== 0) {
          if (isHeader) toTableCell(tr, schema, cell);
        }
      } else {
        if (isHeader) toTableCell(tr, schema, cell);
      }

      // create however many cells (header or cell)
      // and insert it at the last cell of a row if needed
      const isLastCell = cellIndex === row.length - 1;
      if (isLastCell && fillRowCount > 0) {
        const nodes = [];
        const type = isHeaderRow ? "tableHeader" : "tableCell";

        const item = schema.nodes.tableItem.create(null);
        const cellNode = schema.nodes[type].create(null, item);

        for (let i = 0; i < fillRowCount; i++) {
          nodes.push(cellNode);
        }

        tr.insert(tr.mapping.map(cell.pos), Fragment.from(nodes));
      }
    });
  });
};

export default fixTable;
