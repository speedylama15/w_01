import { Extension } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";

import { CellSelecting_Key } from "./CellSelecting/CellSelecting_Plugin";

const CELL_SELECTING = "CELL_SELECTING";

export const tr_extension = Extension.create({
  name: "tr_extension",

  addStorage() {
    return {
      isSelecting: null,
    };
  },

  //   dispatchTransaction({ transaction, next }) {
  //     console.log("dispatchTransaction", transaction.meta);

  //     // const selection = transaction.selection;
  //     // transaction.doc.nodesBetween(selection.from, selection.to, (node) => {
  //     //   if (node.attrs.nodeType === "block") {
  //     //     console.log(node.textContent);
  //     //     return false;
  //     //   }
  //     // });

  //     const cellSelectingState = transaction.getMeta("CELL_SELECTING");

  //     if (cellSelectingState) {
  //       const { isCellSelecting } = cellSelectingState;

  //       this.storage.isSelecting = isCellSelecting ? true : null;
  //     }

  //     if (this.storage.isSelecting && transaction.docChanged) {
  //       return;
  //     }

  //     next(transaction);
  //   },
});

export const tr_plugin = new Plugin({
  // do steps get batched up into a single tr?
  //   filterTransaction(tr, state) {
  //     const cellSelectingState = CellSelecting_Key.getState(state);
  //     // console.log("filterTransaction", cellSelectingState);
  //     return true; // let it through
  //   },
  //   appendTransaction(trs, oldState, newState) {},
});
