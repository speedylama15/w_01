import { Extension } from "@tiptap/core";

import { getNearestNode } from "../utils";

const getCurrAndPrevNodes = () => {};

const getCurrAndPrevBlocks = () => {};

const Arrows = Extension.create({
  name: "arrows",

  addKeyboardShortcuts() {
    return {
      ArrowUp: ({ editor }) => {
        const { tr, selection } = editor.state;
        const { dispatch } = editor.view;
        const { from, to, $anchor } = selection;

        const result = getNearestNode($anchor);
        if (!result) return true; // fix: throw error?

        const { node: currNode, depth } = result;
        // const currNode_bef =

        return true;
      },

      ArrowRight: ({ editor }) => {
        const { tr } = editor.state;
        const { dispatch } = editor.view;

        return true;
      },

      ArrowDown: ({ editor }) => {
        const { tr } = editor.state;
        const { dispatch } = editor.view;

        return true;
      },

      ArrowLeft: ({ editor }) => {
        const { tr } = editor.state;
        const { dispatch } = editor.view;

        return true;
      },
    };
  },
});

export default Arrows;
