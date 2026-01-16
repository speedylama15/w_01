import { Plugin, PluginKey } from "@tiptap/pm/state";

import blockHandleStore from "../../stores/blockHandleStore";

const BlockHandleKey = new PluginKey("BlockHandleKey");

const BlockHandle = new Plugin({
  key: BlockHandleKey,

  // todo: prevent native drag and drop (not DragHandle)
  // review: dragStart may be the only that is needed...
  props: {
    handleDrop(view, e) {
      e.preventDefault();
      return true;
    },
    handleDOMEvents: {
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

      mousemove(view, e) {
        // review: 50 for the padding of the contenteditable
        const elements = view.root.elementsFromPoint(e.clientX + 50, e.clientY);

        const blockDOM = elements.find((el) => el.classList.contains("block"));

        if (blockDOM) {
          const rect = blockDOM.getBoundingClientRect();

          const { set_isOpen, set_rect, set_dom } = blockHandleStore.getState();

          set_isOpen(true);
          set_rect(rect);
          set_dom(blockDOM);
        }
      },

      // mouseleave() {
      //   console.log("mouse leave");

      //   const { set_isOpen, set_rect, set_dom } = blockHandleStore.getState();

      //   set_isOpen(false);
      //   set_rect(null);
      //   set_dom(null);
      // },

      //
    },
  },
});

export default BlockHandle;
