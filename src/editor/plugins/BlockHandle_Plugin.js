import { Plugin } from "@tiptap/pm/state";

import blockHandleStore from "../stores/blockHandleStore";

export const BlockHandle_Plugin = new Plugin({
  props: {
    handleDOMEvents: {
      mousemove(view, e) {
        const elements = view.root.elementsFromPoint(e.clientX + 50, e.clientY);

        const blockDOM = elements.find((el) => el.classList.contains("block"));

        if (blockDOM) {
          const rect = blockDOM.getBoundingClientRect();
          const pos = view.posAtDOM(blockDOM) - 1;
          const node = view.state.doc.nodeAt(pos);

          const { set_blockHandle } = blockHandleStore.getState();

          set_blockHandle({ isOpen: true, rect, dom: blockDOM, node, pos });
        }
      },

      mouseleave(view, e) {
        const { set_blockHandle } = blockHandleStore.getState();

        const blockHandle = e.relatedTarget?.closest(".block-handle");

        if (!blockHandle) set_blockHandle({ isOpen: false });
      },
      //
    },
  },
});
