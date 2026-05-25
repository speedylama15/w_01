import { Extension } from "@tiptap/core";

const handleTransactionExtension = Extension.create({
  name: "tr_extension",

  dispatchTransaction({ transaction, next }) {
    try {
      transaction.steps.forEach((step) => {
        const result = step.apply(transaction.doc);

        if (result.failed) throw new Error("error");
      });

      next(transaction);
    } catch {
      return;
    }
  },
});

export default handleTransactionExtension;
