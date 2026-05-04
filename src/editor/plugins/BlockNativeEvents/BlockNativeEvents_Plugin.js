import { Plugin } from "@tiptap/pm/state";

const BlockNativeEvents_Plugin = new Plugin({
  props: {
    handleDOMEvents: {
      dragstart(view, e) {
        e.preventDefault();
      },
    },
  },

  view() {
    // fix: may have to move this to a place that can be active for my entire app
    // todo: block this later because I need this for inspecting HTML elements
    const handleContextMenu = (e) => {
      e.preventDefault();
      return;
    };

    // document.addEventListener("contextmenu", handleContextMenu);

    return {
      destroy() {
        // document.removeEventListener("contextmenu", handleContextMenu);
      },
    };
  },
});

export default BlockNativeEvents_Plugin;
