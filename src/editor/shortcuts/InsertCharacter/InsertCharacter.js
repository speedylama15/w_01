import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import { Fragment } from "@tiptap/pm/model";
import { CellSelection } from "prosemirror-tables";
import { MultiBlockSelection } from "../../selections/MultiBlockSelection";
import { ReplaceAroundStep, ReplaceStep } from "@tiptap/pm/transform";

import { deleteContentInRangedSelection, getTableMap } from "../../utils";

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

const fixTable = (tableID, tr, schema) => {
  let newTableNode = null;
  let newTableBefore = null;

  tr.doc.descendants((node, pos) => {
    if (node.attrs.id === tableID) {
      newTableNode = node;
      newTableBefore = pos;

      return false;
    }

    if (node.attrs.nodeType === "block") {
      return false;
    }
  });

  if (!newTableNode) return;

  const tableMap = getTableMap(newTableNode, newTableBefore);
  const { grid } = tableMap;

  let targetRowCount = 0;
  grid.forEach((row) => {
    if (row.length > targetRowCount) targetRowCount = row.length;
  });

  const isHeaderColumn = newTableNode.attrs.isHeaderColumn;
  const isHeaderRow = newTableNode.attrs.isHeaderRow;

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

// review: everything is strictly a waterfall
// review: use the state's from and to and not the step
// todo: narrow down the condition inside of appendTransaction

const InsertCharacter = new Plugin({
  appendTransaction(transactions, oldState, newState) {
    let isDeleteContentFromRangedSelection = false;
    // const { from, to } = oldState.selection;
    const { from, to, head } = newState.selection;

    const tr = newState.tr;

    transactions.forEach((transaction) => {
      isDeleteContentFromRangedSelection = transaction.getMeta(
        "deleteContentInRangedSelection",
      );
    });

    if (isDeleteContentFromRangedSelection) {
      deleteContentInRangedSelection(tr, from, to);

      const pos = tr.mapping.map(head);
      const near = TextSelection.near(tr.doc.resolve(pos));
      tr.setSelection(near);

      return tr;
    }
  },

  props: {
    handlePaste() {
      console.log("paste");
    },

    handleDOMEvents: {
      cut() {
        console.log("cut");
      },
    },
  },
});

export default InsertCharacter;
