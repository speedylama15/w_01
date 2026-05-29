import { Plugin } from "@tiptap/pm/state";
import { DecorationSet } from "@tiptap/pm/view";

import { trackActivityKey } from "../trackActivity/trackActivity";

import blockHandleStore from "./blockHandleStore";

const blockHandle = () => {
  return new Plugin({
    props: {
      handleDOMEvents: {
        mousemove(view, e) {
          const { operation } = trackActivityKey.getState(view.state);
          if (operation) return;

          const { isLocked, renderHandle, hideHandle } =
            blockHandleStore.getState();
          if (isLocked) return;

          const contenteditableDOM = view.dom;
          const rect = contenteditableDOM.getBoundingClientRect();

          const pointX = rect.left + rect.width / 2 + 50;
          const elements = view.root.elementsFromPoint(pointX, e.clientY);
          const block = elements.find((el) => el.classList.contains("block"));

          if (block) renderHandle(block, block.getBoundingClientRect());

          if (!block) hideHandle();
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
      },
    },
  });
};

export default blockHandle;
