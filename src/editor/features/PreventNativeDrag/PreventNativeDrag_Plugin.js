import { Plugin } from "@tiptap/pm/state";

const PreventNativeDrag_Plugin = new Plugin({
  props: {
    handleDOMEvents: {
      dragstart(view, e) {
        e.preventDefault();
      },
    },
  },
});

export default PreventNativeDrag_Plugin;
