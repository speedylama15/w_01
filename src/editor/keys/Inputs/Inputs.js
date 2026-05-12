import { Extension } from "@tiptap/core";
import { Slice, Fragment } from "prosemirror-model";
import { ReplaceAroundStep, ReplaceStep } from "@tiptap/pm/transform";
import { Table } from "@tiptap/extension-table";
import { TextSelection } from "@tiptap/pm/state";
import { MultiBlockSelection } from "../../selections/MultiBlockSelection";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { CellSelection } from "prosemirror-tables";

import { fixTable } from "../../utils";

const getTextContent = (step) => {
  let textContent = "";

  const contents = step.slice?.content?.content;

  if (contents) {
    contents.forEach((content) => {
      textContent += content.textContent;
    });
  }

  return textContent;
};

export const InputsExtension = Extension.create({
  name: "inputsExtension",

  // dispatchTransaction({ transaction, next }) {
  //   const step = transaction.steps[0];

  //   // console.log("dispatchTransaction", step); // fix

  //   if (step) {
  //     const newTr = this.editor.state.tr;
  //     const head = this.editor.state.selection.head;

  //     const { from: stepFrom, to: stepTo } = step;

  //     const textContent = getTextContent(step);

  //     if (
  //       textContent &&
  //       stepFrom !== stepTo &&
  //       (step instanceof ReplaceStep || step instanceof ReplaceAroundStep)
  //     ) {
  //       // fix: I could add textContent.length === 1, but I'm not sure
  //       // fix: it fails to catch insertion of emoji...
  //       console.log("Ranged selection and insert char", {
  //         textContent,
  //       });

  //       const inspectFrom = Math.max(0, stepFrom);
  //       const inspectTo = Math.min(transaction.doc.content.size, step.to);

  //       newTr.setMeta("customDelete", {
  //         isCustomDelete: true,
  //         from: inspectFrom,
  //         to: inspectTo,
  //         head,
  //         char: textContent,
  //       });

  //       next(newTr);

  //       return;
  //     }
  //   }

  //   next(transaction);
  // },
});

export const Input_Plugin = new Plugin({
  // appendTransaction(transactions, oldState, newState) {
  //   let isCustomDelete = null;
  //   // let customStep = null;
  //   const { from, to, head } = newState.selection;
  //   const tr = newState.tr;
  //   transactions.forEach((transaction) => {
  //     isCustomDelete = transaction.getMeta("customDelete");
  //   });
  //   if (isCustomDelete) {
  //     const { char } = isCustomDelete;
  //     deleteContentInRangedSelection(tr, from, to);
  //     const pos = tr.mapping.map(head);
  //     const near = TextSelection.near(tr.doc.resolve(pos));
  //     const insertPos = near.$anchor.pos;
  //     tr.insertText(char, insertPos);
  //     const $insertPos = tr.doc.resolve(insertPos + 1);
  //     tr.setSelection(TextSelection.near($insertPos));
  //     return tr;
  //   }
  // },
});
