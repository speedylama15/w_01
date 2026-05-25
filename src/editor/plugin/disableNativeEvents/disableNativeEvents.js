import { Plugin } from "@tiptap/pm/state";

const disableNativeEvents = new Plugin({
  view() {
    // todo: maybe I can use this to implement my own context menu?
    // fix: but can this really block out context menu?
    // todo: block this later
    const contextMenu = (e) => {
      e.preventDefault();
    };

    const dragstart = (e) => {
      e.preventDefault();
    };

    // document.addEventListener("contextmenu", contextMenu);
    document.addEventListener("dragstart", dragstart);

    return {
      destroy() {
        // document.removeEventListener("contextmenu", contextMenu);
        document.removeEventListener("dragstart", dragstart);
      },
    };
  },
});

export default disableNativeEvents;
