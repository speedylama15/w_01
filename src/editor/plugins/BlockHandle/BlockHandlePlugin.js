import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { MultipleNodeSelection } from "../../selections/MultipleNodeSelection";

import blockHandleStore from "../../stores/blockHandleStore";

export const BlockHandleKey = new PluginKey("BlockHandleKey");

export const BlockHandlePlugin = new Plugin({
  key: BlockHandleKey,

  props: {
    attributes(state) {
      if (state.selection instanceof MultipleNodeSelection) {
        return { class: "has-multiple-node-selection" };
      }

      return null;
    },

    decorations(state) {
      if (state.selection instanceof MultipleNodeSelection) {
        const decorations = [];

        state.selection.positions.forEach(({ from, to }) => {
          const dec = Decoration.node(from, to, {
            class: "multiple-node-selection",
          });

          decorations.push(dec);
        });

        return DecorationSet.create(state.doc, decorations);
      }

      return DecorationSet.empty;
    },

    // idea: prevent browser's native drag and drop (not DragHandle)
    // like dragging highlighted texts or images
    handleDrop(view, e) {
      e.preventDefault();
      return true;
    },

    // review: dragStart may be the only one that is needed...
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
          const pos = view.posAtDOM(blockDOM) - 1;
          const node = view.state.doc.nodeAt(pos);

          const { set_isOpen, set_rect, set_dom, set_pos, set_node } =
            blockHandleStore.getState();

          set_isOpen(true);
          set_rect(rect);
          set_dom(blockDOM);
          set_pos(pos);
          set_node(node);
        }
      },

      // fix: I feel like I need this
      mouseleave() {
        // console.log("mouse leave");
        // const { set_isOpen, set_rect, set_dom } = blockHandleStore.getState();
        // set_isOpen(false);
        // set_rect(null);
        // set_dom(null);
      },
      //
    },
  },
});
