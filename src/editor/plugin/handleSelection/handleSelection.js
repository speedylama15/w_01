import { Plugin } from "@tiptap/pm/state";
import MultiSelection from "../../selection/MultiSelection";

const handleSelection = () => {
  return new Plugin({
    props: {
      // idea: createSelectionBetween triggers before dipatchTransaction and apply()
      createSelectionBetween(view, $anchor, $head) {
        if ($anchor.pos === $head.pos) return null;

        const from = Math.min($anchor.pos, $head.pos);
        const to = Math.max($anchor.pos, $head.pos);

        let setMulti = false;

        view.state.doc.nodesBetween(from, to, (node) => {
          if (node.attrs.nodeType === "block") {
            if (!node.isTextblock) setMulti = true;

            return false;
          }
        });

        if (setMulti) {
          return MultiSelection.create(view.state.tr.doc, from, to);
        }

        return null;
      },
    },
  });
};

export default handleSelection;
