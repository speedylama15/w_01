import { Plugin } from "@tiptap/pm/state";
import { DecorationSet, Decoration } from "@tiptap/pm/view";
import MultiSelection from "../../selection/MultiSelection";

const renderMultiSelection = new Plugin({
  props: {
    decorations(state) {
      const { selection } = state;

      if (selection instanceof MultiSelection) {
        const decs = selection.nodes.map((node) => {
          const { before, after } = node;

          const dec = Decoration.node(before, after, {
            class: "multi-selection",
          });

          return dec;
        });

        return DecorationSet.create(state.tr.doc, decs);
      }

      return DecorationSet.empty;
    },
  },
});

export default renderMultiSelection;
