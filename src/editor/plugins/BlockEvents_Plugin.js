import { Plugin } from "@tiptap/pm/state";

export const BlockEvents_Plugin = new Plugin({
  props: {
    handleTripleClick(view, pos, e) {
      e.preventDefault();
      e.stopPropagation();
      return true;
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

      // selectStart? <- will disable text selection entirely...

      dragstart(view, e) {
        e.preventDefault();
        return true;
      },
      drag(view, e) {
        e.preventDefault();
        return true;
      },
      dragover(view, e) {
        e.preventDefault();
        return true;
      },
    },
  },
});
