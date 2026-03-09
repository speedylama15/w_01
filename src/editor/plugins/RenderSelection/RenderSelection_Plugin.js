import { Plugin } from "@tiptap/pm/state";
import { DecorationSet, Decoration } from "@tiptap/pm/view";

import { MultiBlockSelection } from "../../selections/MultiBlockSelection";

export const RenderSelection_Plugin = new Plugin({
  props: {
    // attributes(state) {
    //   if (state.selection instanceof MultiBlockSelection) {
    //     return { class: "has-multi-block-selection" };
    //   }

    //   return {};
    // },

    decorations(state) {
      const { selection } = state;

      if (selection instanceof MultiBlockSelection) {
        const decos = selection.positions.map((pos) =>
          Decoration.node(pos.before, pos.after, {
            class: "multi-block-selection",
          }),
        );

        return DecorationSet.create(state.doc, decos);
      }

      return DecorationSet.empty;
    },
  },
});
