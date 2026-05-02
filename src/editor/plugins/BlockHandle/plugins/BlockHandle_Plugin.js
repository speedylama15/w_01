import { Plugin } from "@tiptap/pm/state";

import blockHandleStore from "../stores/blockHandleStore";

// review: .getState() is amazing when used in listeners or observers

const BlockHandle_Plugin = new Plugin({
  props: {
    handleDOMEvents: {
      mousemove(view, e) {
        // review: in certain operations like drag and drop, I need e.stopPropagation()

        const { isLocked } = blockHandleStore.getState();
        if (isLocked) return;

        // add 50 because that is the padding value
        const elements = view.root.elementsFromPoint(e.clientX + 50, e.clientY);
        const block = elements.find((el) => el.classList.contains("block"));

        if (block) {
          const { setIsRendered, setRect, setDOM } =
            blockHandleStore.getState();

          setIsRendered(true);
          setRect(block.getBoundingClientRect());
          setDOM(block);
        }
      },

      mouseleave(view, e) {
        const relatedTarget = e.relatedTarget;

        if (relatedTarget && relatedTarget.closest(".portal")) return;
      },
      //
    },
  },
});

export default BlockHandle_Plugin;
