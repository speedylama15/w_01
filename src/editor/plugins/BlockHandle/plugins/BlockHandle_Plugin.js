import { Plugin } from "@tiptap/pm/state";

import blockHandleStore from "../stores/blockHandleStore";
import { DecorationSet } from "@tiptap/pm/view";

const BlockHandle_Plugin = new Plugin({
  state: {
    init() {
      return null;
    },

    apply(tr, value) {
      const set = tr.getMeta("EDITOR_DRAG_AND_DROP");

      if (set) return set;

      return value;
    },
  },

  props: {
    decorations(state) {
      const set = this.getState(state);

      if (set) return set;

      return DecorationSet.empty;
    },

    handleDOMEvents: {
      mousemove(view, e) {
        const { isLocked, renderHandle, hideHandle } =
          blockHandleStore.getState();

        if (isLocked) return;

        // // do nothing when the handle has either been clicked or is getting dragged
        // if (isClicked || isDragging) return;

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

        if (block) {
          const rect = block.getBoundingClientRect();

          renderHandle(block, rect);

          return;
        }

        if (!block) {
          hideHandle();

          return;
        }
      },

      mouseleave(view, e) {
        const { isLocked, hideHandle } = blockHandleStore.getState();

        if (isLocked) return;

        const relatedTarget = e.relatedTarget;

        if (relatedTarget && relatedTarget.closest(".portal")) {
          return;
        } else {
          hideHandle();

          return;
        }
      },
      //
    },
  },
});

export default BlockHandle_Plugin;
