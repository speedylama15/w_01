import { Extension } from "@tiptap/core";

import { MultipleNodeSelection } from "../selections/MultipleNodeSelection";
import { TextSelection } from "@tiptap/pm/state";

export const KeyboardShortcuts = Extension.create({
  name: "keyboardShortcuts",

  addKeyboardShortcuts() {
    return {
      // just editor
      Backspace: ({ editor }) => {
        // debug
        console.log("backspace");

        const { view } = editor;
        const { selection } = editor.state;

        const { tr } = view.state;
        const { dispatch } = view;

        if (selection instanceof MultipleNodeSelection) {
          const from = selection.positions[0].from;
          const to = selection.positions[selection.positions.length - 1].to;

          tr.deleteRange(from, to);
          tr.setSelection(TextSelection.create(tr.doc, from + 1));

          dispatch(tr);

          return true;
        }

        return false;
      },
      //
    };
  },
});
