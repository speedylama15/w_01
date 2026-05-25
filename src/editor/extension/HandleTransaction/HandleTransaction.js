import { Extension } from "@tiptap/core";

const HandleTransaction = Extension.create({
  name: "handleTransaction",

  dispatchTransaction({ transaction, next }) {
    try {
      transaction.steps.forEach((step, i) => {
        // review: each step has its corresponding doc
        const result = step.apply(transaction.docs[i]);

        if (result.failed) throw new Error("error");
      });

      next(transaction);
    } catch {
      return;
    }
  },
});

export default HandleTransaction;
