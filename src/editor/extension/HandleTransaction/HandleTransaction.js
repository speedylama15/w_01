import { Extension } from "@tiptap/core";
import { CellSelection } from "prosemirror-tables";
import { TextSelection } from "@tiptap/pm/state";
import { ReplaceStep, ReplaceAroundStep } from "@tiptap/pm/transform";
import { handleBadSelection } from "../../utils";

const getIsWithinRange = (innerFrom, innerTo, outerFrom, outerTo) => {
  return innerFrom >= outerFrom && innerTo <= outerTo;
};

const getTextContentFromSlice = (slice) => {
  let contents = slice;

  while (!Array.isArray(contents)) {
    contents = contents.content;
  }

  let textContent = "";

  contents.forEach((node) => (textContent += node.textContent));

  return textContent;
};

const isEmptyObject = (obj) => {
  return Object.keys(obj).length === 0;
};

const HandleTransaction = Extension.create({
  name: "handleTransaction",
  priority: 10000000,

  dispatchTransaction({ transaction, next }) {
    try {
      const { selection } = this.editor.state;
      const { from, to, anchor, head } = selection;
      const { docChanged, meta } = transaction;

      // review: doc changed, there is no meta, and selection is ranged
      if (
        docChanged &&
        isEmptyObject(meta) &&
        selection instanceof TextSelection &&
        anchor !== head
      ) {
        const steps = transaction.steps;

        let isBadSelection = false;
        let textContent = null;

        for (const step of steps) {
          const { from, to } = step;

          if (
            step instanceof ReplaceStep ||
            step instanceof ReplaceAroundStep
          ) {
            const slice = step.slice;
            // review: text content must not be empty
            textContent = getTextContentFromSlice(slice);

            // break if there is no text
            if (textContent.length === 0) {
              break;
            }

            transaction.before.nodesBetween(step.from, step.to, (node, pos) => {
              if (node.attrs.nodeType === "block") {
                if (node.type.name === "table") {
                  const isWithinRange = getIsWithinRange(
                    pos + 4,
                    pos + node.nodeSize - 4,
                    from,
                    to,
                  );

                  if (!isWithinRange) isBadSelection = true;
                }

                return false;
              }
            });
          }
        }

        if (isBadSelection) {
          const tr = this.editor.state.tr;

          handleBadSelection(tr, from, to);

          const mappedPos = tr.mapping.map(head);
          const resolvedPos = tr.doc.resolve(mappedPos);
          const validSelection = TextSelection.near(resolvedPos);

          tr.setSelection(validSelection);
          tr.insertText(textContent, validSelection.from);

          next(tr);

          return;
        }
      }

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
