import { Plugin } from "@tiptap/pm/state";
import { DecorationSet, Decoration } from "@tiptap/pm/view";

import { getNearestNode, isCellNode } from "../../utils";

const placeholder = new Plugin({
  props: {
    decorations(state) {
      const { selection } = state;
      const { $anchor, from, to } = selection;

      if (from !== to) return DecorationSet.empty;

      const result = getNearestNode($anchor);
      if (!result || isCellNode(result.node) || result.node.content.size !== 0)
        return DecorationSet.empty;

      const before = $anchor.before(result.depth);
      const after = before + result.node.nodeSize;

      const dec = Decoration.node(before, after, {
        class: "empty-node-message",
      });

      return DecorationSet.create(state.tr.doc, [dec]);
    },
  },
});

export default placeholder;
