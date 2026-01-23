import { Extension } from "@tiptap/core";

import { MultiBlockSelection } from "../selections/MultiBlockSelection";
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

        if (selection instanceof MultiBlockSelection) {
          const from = selection.positions[0].before;
          const to = selection.positions[selection.positions.length - 1].after;

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
