import { Plugin, PluginKey } from "@tiptap/pm/state";

export const trailingNode = new Plugin({
  appendTransaction: (transactions, oldState, newState) => {
    const { tr } = newState;

    const lastChild = newState.doc.lastChild;
    const paragraph = newState.schema.nodes.paragraph;

    if (lastChild.type.name === "paragraph" && lastChild.content.size === 0)
      return null;

    // is this accurate?
    const pos = newState.doc.content.size - 1;

    // review: I need to set this meta for FixTable_Plugin
    return tr.setMeta("trailingNode", true).insert(pos, paragraph.create());
  },
});

export default trailingNode;
