import { Extension } from "@tiptap/core";
import { CellSelection } from "prosemirror-tables";
import { TextSelection } from "@tiptap/pm/state";
import { ReplaceStep, ReplaceAroundStep } from "@tiptap/pm/transform";

const getProperty = (name) => {
  if (name === "table") return "table";
  if (name === "tableCell" || name === "tableHeader") return "cell";

  return "other";
};

const HandleTransaction = Extension.create({
  name: "handleTransaction",

  dispatchTransaction({ transaction, next }) {
    try {
      const { selection } = this.editor.state;
      const { docChanged } = transaction;

      const undo = transaction.getMeta("undo");
      const redo = transaction.getMeta("redo");

      if (undo || redo) {
        next(transaction);

        return;
      }

      // // if bad selection is encountered, ALL transaction will collapse the selection
      // // bad selection should not have been set to begin with
      // if (
      //   docChanged &&
      //   // I thought editor.state.selection would give me an accurate previous selection
      //   // but that is not the case when the selection mixes table cells with other nodes
      //   // aka the step is a ReplaceAroundStep
      //   // However, this.editor.state.selection does still give an accurate instance of the previous selection
      //   selection instanceof TextSelection
      // ) {
      //   const obj = {};
      //   const steps = transaction.steps;

      //   steps.forEach((step) => {
      //     const stepFrom = step.from;
      //     const stepTo = step.to;

      //     transaction.before.nodesBetween(stepFrom, stepTo, (node) => {
      //       const name = node.type.name;
      //       const property = getProperty(name);

      //       if (node.attrs.nodeType === "block") {
      //         if (obj[property]) {
      //           obj[property] += 1;
      //         } else {
      //           obj[property] = 1;
      //         }
      //       }

      //       // ignore tableRow and allow the loop to reach tableCell/Header
      //       if (
      //         node.type.name === "tableCell" ||
      //         node.type.name === "tableHeader"
      //       ) {
      //         if (obj[property]) {
      //           obj[property] += 1;
      //         } else {
      //           obj[property] = 1;
      //         }

      //         return false;
      //       }
      //     });
      //   });

      //   if (obj.cell > 1 || (obj.table && obj.other)) {
      //     console.log("BAD SELECTION!!!"); // fix

      //     const tr = this.editor.state.tr;

      //     const resolvedPos = tr.doc.resolve(transaction.selection.head);
      //     const validSelection = TextSelection.near(resolvedPos);

      //     tr.setSelection(validSelection);

      //     next(tr);

      //     return;
      //   } else {
      //     next(transaction);

      //     return;
      //   }
      // }

      // fix: this does not catch all errors unfortunately...
      for (let i = 0; i < transaction.steps.length; i++) {
        const step = transaction.steps[i];

        // review: each step has its corresponding doc
        const result = step.apply(transaction.docs[i]);

        if (result.failed) throw new Error("error");
      }

      next(transaction);
    } catch (e) {
      // fix
      console.log("ERROR!", e);

      return;
    }
  },
});

export default HandleTransaction;
