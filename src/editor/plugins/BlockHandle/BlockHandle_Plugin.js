import { Plugin } from "@tiptap/pm/state";

import BlockHandleStore from "../../stores/BlockHandleStore";

export const BlockHandle_Plugin = new Plugin({
  props: {
    handleDOMEvents: {
      mousemove(view, e) {
        const { isDown } = BlockHandleStore.getState();

        if (isDown) return;

        // add 50 because that is the padding value
        const elements = view.root.elementsFromPoint(e.clientX + 50, e.clientY);
        const block = elements.find((el) => el.classList.contains("block"));

        if (block) {
          const rect = block.getBoundingClientRect();

          const { set } = BlockHandleStore.getState();

          set(true, rect, block);
        }
      },

      mouseleave(view, e) {
        const relatedTarget = e.relatedTarget;

        if (relatedTarget && relatedTarget.closest(".portal")) return;

        const { setIsOpen } = BlockHandleStore.getState();

        // fix: close only when mouse has left
        // fix: isHandleDown, isDragging, leave it alone

        setIsOpen(false);
      },
      //
    },
  },
});
