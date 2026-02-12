import { Plugin, PluginKey } from "@tiptap/pm/state";

const TrailingNode_Key = new PluginKey("TrailingNode_Key");

export const TrailingNode_Plugin = new Plugin({
  key: TrailingNode_Key,

  appendTransaction: (transactions, oldState, newState) => {
    const { doc, tr, schema } = newState;

    const shouldAdd = TrailingNode_Key.getState(newState);

    if (!shouldAdd) {
      return;
    }

    const pos = doc.content.size - 1;
    const contentType = schema.nodes.paragraph;

    return tr.insert(pos, contentType.create());
  },

  state: {
    init() {
      return false;
    },

    apply(tr, value) {
      if (!tr.docChanged) {
        return value;
      }

      const lastNode = tr.doc.lastChild;

      // if the last node is NOT paragraph
      if (!lastNode || lastNode.type.name !== "paragraph") {
        return true;
      }

      // if last node is paragraph but is not empty
      if (lastNode.type.name === "paragraph" && lastNode.content.size !== 0) {
        return true;
      }

      return false;
    },
  },
});
