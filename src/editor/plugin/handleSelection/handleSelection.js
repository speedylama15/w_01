import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import MultiSelection from "../../selection/MultiSelection";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

const handleSelection = () => {
  return new Plugin({
    props: {
      createSelectionBetween(view, $anchor, $head) {
        if ($anchor.pos === $head.pos) return null;

        // idea: isSelectingInCell, isCellSelecting

        const from = Math.min($anchor.pos, $head.pos);
        const to = Math.max($anchor.pos, $head.pos);

        let setMulti = false;

        // view.state.tr.doc? or view.state.doc?
        view.state.doc.nodesBetween(from, to, (node) => {
          if (node.attrs.nodeType === "block") {
            if (!node.isTextblock) setMulti = true;

            return false;
          }
        });

        if (setMulti) {
          const multi = MultiSelection.create(view.state.doc, from, to);

          return multi;
        }
      },

      decorations(state) {
        const { selection } = state;
        const { from, to } = selection;

        if (from === to) return DecorationSet.empty;

        if (selection instanceof TextSelection) {
          const dec = Decoration.inline(from, to, {
            class: "text-selection",
          });
          const set = DecorationSet.create(state.tr.doc, [dec]);

          return set;
        }

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
      },
    },
  });
};

export default handleSelection;
