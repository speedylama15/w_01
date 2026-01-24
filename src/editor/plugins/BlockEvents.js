import { Plugin } from "@tiptap/pm/state";

export const BlockEvents = new Plugin({
  props: {
    handleTripleClick(view, pos, e) {
      e.preventDefault();
      e.stopPropagation();
      return true;
    },

    // fix: do I need this?
    handleDrop(view, e) {
      e.preventDefault();
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

      dragstart(view, e) {
        e.preventDefault();
        return true;
      },
      drag(view, e) {
        e.preventDefault();
        return true;
      },
      drop(view, e) {
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
