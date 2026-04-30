import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import { MultiBlockSelection } from "../selections/MultiBlockSelection";

import { deleteContentInRangedSelection } from "../utils";

const Character = new Plugin({
  props: {
    handleTextInput(view, from, to, text) {
      const { tr, selection } = view.state;
      const { dispatch } = view;

      if (selection.from !== selection.to) {
        deleteContentInRangedSelection(tr, selection.from, selection.to);

        const pos = tr.mapping.map(from);
        const near = TextSelection.near(tr.doc.resolve(pos));

        tr.insertText(text, near.from);
        tr.setSelection(TextSelection.create(tr.doc, near.from + 1));

        dispatch(tr);

        return true;
      }

      return false; // Prosemirror handle it
    },
  },
});

export default Character;
