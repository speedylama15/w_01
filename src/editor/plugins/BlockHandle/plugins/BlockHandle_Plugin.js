import { Plugin } from "@tiptap/pm/state";

import blockHandleStore from "../stores/blockHandleStore";

const BlockHandle_Plugin = new Plugin({
  props: {
    handleDOMEvents: {
      mousemove(view, e) {
        const { isClicked } = blockHandleStore.getState();

        // review: lock the handle since the dropdown is rendered
        if (isClicked) return;

        const contenteditableDOM = view.dom;
        const rect = contenteditableDOM.getBoundingClientRect();

        let mouseX = e.clientX;

        if (e.clientX >= rect.left && e.clientX <= rect.left + 50) {
          mouseX = e.clientX + 50;
        }

        if (e.clientX >= rect.right - 50 && e.clientX <= rect.right) {
          mouseX = e.clientX - 50;
        }

        // add padding value
        const elements = view.root.elementsFromPoint(mouseX, e.clientY);
        const block = elements.find((el) => el.classList.contains("block"));

        const { setDOM, setRect } = blockHandleStore.getState();

        if (block) {
          setDOM(block);
          setRect(block.getBoundingClientRect());

          return;
        }

        if (!block) {
          setDOM(null);
          setRect(null);

          return;
        }
      },

      mouseleave(view, e) {
        const relatedTarget = e.relatedTarget;

        if (relatedTarget && relatedTarget.closest(".portal")) {
          return;
        } else {
          const { setDOM, setRect } = blockHandleStore.getState();

          setDOM(null);
          setRect(null);

          return;
        }
      },
      //
    },
  },
});

export default BlockHandle_Plugin;
