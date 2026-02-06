import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

export const Placeholder_Plugin = new Plugin({
  props: {
    decorations: (state) => {
      const { doc, selection } = state;

      const decs = [];

      const $pos = selection.$anchor;
      const node = $pos.parent;

      if (node.type.name === "paragraph" && node.content.size === 0) {
        const before = $pos.before();

        decs.push(
          // fix: maybe can come up with a better name?
          Decoration.node(before, before + node.nodeSize, {
            "placeholder_empty-node": "true",
          }),
        );
      }

      return DecorationSet.create(doc, decs);
    },
  },
  //
});
