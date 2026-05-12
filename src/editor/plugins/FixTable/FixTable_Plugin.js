import { Plugin, TextSelection } from "@tiptap/pm/state";

import { fixTable } from "../../utils";

export const FixTable_Plugin = new Plugin({
  appendTransaction(transactions, oldState, newState) {
    let docChanged = false;
    let trailingNode = false;

    const trs = transactions;

    // fixTable -> trailingNode -> fixTable (do not let this run again)
    // prevent re-run of fixTable by getting the meta and if it's trailingNode, do nothing
    trs.forEach((tr) => {
      if (tr.docChanged) docChanged = true;
      if (tr.getMeta("trailingNode")) trailingNode = true;
    });

    if (
      docChanged &&
      !trailingNode &&
      oldState.selection instanceof TextSelection &&
      oldState.selection.from !== oldState.selection.to
    ) {
      const selection = oldState.selection;
      const { from, to } = selection;

      let firstBlock = null;
      let lastBlock = null;

      oldState.doc.nodesBetween(from, to, (node) => {
        if (node.attrs.nodeType === "block") {
          if (!firstBlock) firstBlock = node;

          lastBlock = node;

          return false;
        }
      });

      // end if the first and the last blocks are not table
      if (
        firstBlock?.type.name !== "table" &&
        lastBlock?.type.name !== "table"
      ) {
        return null;
      }

      const tr = newState.tr;
      const schema = newState.schema;

      let newFirstBlockData = null;
      let newLastBlockData = null;

      // using tr.mapping or looping through transactions to map the pos is very inconsistent for some reason
      newState.doc.descendants((node, pos) => {
        if (node.attrs.nodeType === "block") {
          if (node.attrs.id === firstBlock.attrs.id) {
            newFirstBlockData = { node, pos };
          }

          if (node.attrs.id === lastBlock.attrs.id) {
            newLastBlockData = { node, pos };
          }

          return false;
        }
      });

      const isSameBlock = firstBlock.attrs.id === lastBlock.attrs.id;

      // The table might have been completely deleted, therefore I need to check if newData exists
      if (
        (firstBlock.type.name === "table" &&
          isSameBlock &&
          newFirstBlockData) ||
        firstBlock.type.name === "table"
      ) {
        const { node: tableNode, pos: tableBefore } = newFirstBlockData;

        fixTable(tableNode, tableBefore, tr, schema);

        return tr;
      }

      if (lastBlock.type.name === "table" && newLastBlockData) {
        const { node: tableNode, pos: tableBefore } = newLastBlockData;

        fixTable(tableNode, tableBefore, tr, schema);
      }

      return tr;
    }
  },
});
