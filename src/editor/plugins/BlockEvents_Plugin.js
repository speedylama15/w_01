import { Plugin } from "@tiptap/pm/state";

export const BlockEvents_Plugin = new Plugin({
  props: {
    handleTripleClick(view, pos, e) {
      e.stopPropagation();

      return false;
    },

    handleDOMEvents: {
      mousedown(view, e) {
        if (e.metaKey) {
          return true;
        }

        if (e.ctrlKey) {
          e.preventDefault();
          return true;
        }
      },
    },
  },
});
