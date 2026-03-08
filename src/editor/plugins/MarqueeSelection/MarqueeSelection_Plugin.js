import { Plugin, TextSelection } from "@tiptap/pm/state";
import { DecorationSet, Decoration } from "@tiptap/pm/view";
import Flatbush from "flatbush";

import MarqueeSelectionStore from "./MarqueeSelectionStore";

import { MultiBlockSelection } from "../../selections/MultiBlockSelection";

// todo: when making selection via Marquee Selection, I need to prevent Chrome's native selection
// todo: set a class at the editor level so that I can hide native selection or the caret?

export const MarqueeSelection_Plugin = () => {
  return new Plugin({
    // fix
    props: {
      attributes(state) {
        if (state.selection instanceof MultiBlockSelection) {
          return { class: "has-multi-block-selection" };
        }
        return {};
      },

      decorations(state) {
        const { selection } = state;

        if (selection instanceof MultiBlockSelection) {
          const decos = selection.positions.map((pos) =>
            Decoration.node(pos.before, pos.after, {
              class: "multi-block-selection",
            }),
          );

          return DecorationSet.create(state.doc, decos);
        }

        return DecorationSet.empty;
      },
    },
    // fix

    view(view) {
      let operation = null; // idea: mouseOperation (Zustand state?)
      let flatTree = null;
      let rafID = null;

      const handleMouseDown = (e) => {
        if (e.button !== 0) return; // review: this is absolutely essential!

        const editorDOM = document.querySelector(".editor");
        const editorPageDOM = document.querySelector(".editor-page");

        // review: very important condition
        if (!editorDOM.contains(e.target) && editorPageDOM.contains(e.target)) {
          e.preventDefault();

          const { tr } = view.state;
          const { dispatch } = view;
          const { setIsOpen } = MarqueeSelectionStore.getState();

          tr.setSelection(TextSelection.create(tr.doc, 1));

          const blocks = view.dom.querySelectorAll(".block");
          flatTree = new Flatbush(blocks.length);
          blocks.forEach((block) => {
            const rect = block.getBoundingClientRect();

            const minX = rect.left;
            const maxX = rect.right;
            const minY = rect.top + window.scrollY;
            const maxY = rect.bottom + window.scrollY;

            flatTree.add(minX, minY, maxX, maxY);
          });
          flatTree.finish();

          const onFrameScrollY = () => {
            const { isOpen, currentCoords, setStartCoords, setCurrentCoords } =
              MarqueeSelectionStore.getState();

            if (!isOpen) {
              const coords = {
                clientX: e.clientX,
                clientY: e.clientY,
                pageX: e.pageX,
                pageY: e.pageY,
              };

              setIsOpen(true);
              setStartCoords(coords);
              setCurrentCoords(coords);
            }

            if (currentCoords?.clientY <= 20) {
              // clientX remains the same
              // only the scrollY changes
              const coords = {
                ...currentCoords,
                pageY: currentCoords.clientY + window.scrollY - 5,
              };

              setCurrentCoords(coords);

              window.scrollBy(0, -5);
            }

            if (window.innerHeight - currentCoords?.clientY <= 20) {
              const coords = {
                ...currentCoords,
                pageY: currentCoords.clientY + window.scrollY + 5,
              };

              setCurrentCoords(coords);

              window.scrollBy(0, 5);
            }

            // obtain fresh data
            // each frame, query overlapping nodes
            const s = MarqueeSelectionStore.getState().startCoords;
            const c = MarqueeSelectionStore.getState().currentCoords;

            const minX = Math.min(s.pageX, c.pageX);
            const maxX = Math.max(s.pageX, c.pageX);
            const minY = Math.min(s.pageY, c.pageY);
            const maxY = Math.max(s.pageY, c.pageY);

            const indexes = flatTree
              .search(minX, minY, maxX, maxY)
              .sort((a, b) => a - b);

            if (indexes.length === 0) {
              const multiSelection = MultiBlockSelection.create(tr.doc, 0, 0);

              dispatch(tr.setSelection(multiSelection));
            }

            if (indexes.length === 1) {
              const anchorIndex = indexes[0];
              const anchorBefore = view.posAtDOM(blocks[anchorIndex]) - 1;
              const anchorNode = view.state.doc.nodeAt(anchorBefore);

              const multiSelection = MultiBlockSelection.create(
                tr.doc,
                anchorBefore,
                anchorBefore + anchorNode.nodeSize,
              );

              dispatch(tr.setSelection(multiSelection));
            }

            if (indexes.length > 1) {
              const anchor = indexes[0];
              const head = indexes[indexes.length - 1];

              const anchorBefore = view.posAtDOM(blocks[anchor]) - 1;
              const headBefore = view.posAtDOM(blocks[head]) - 1;
              const headNode = view.state.doc.nodeAt(headBefore);
              const headAfter = headBefore + headNode.nodeSize;

              const multiSelection = MultiBlockSelection.create(
                tr.doc,
                anchorBefore,
                headAfter,
              );

              dispatch(tr.setSelection(multiSelection));
            }

            rafID = requestAnimationFrame(onFrameScrollY);
          };

          operation = "MARQUEE_SELECTION"; // don't need this for now
          rafID = requestAnimationFrame(onFrameScrollY);

          dispatch(tr);

          return;
        }
      };

      const handleMouseMove = (e) => {
        if (operation !== "MARQUEE_SELECTION") return;

        const { setCurrentCoords } = MarqueeSelectionStore.getState();

        setCurrentCoords({
          clientX: e.clientX,
          clientY: e.clientY,
          pageX: e.pageX,
          pageY: e.pageY,
        });
      };

      const handleMouseUp = () => {
        if (operation !== "MARQUEE_SELECTION") return;

        const { setIsOpen, setStartCoords, setCurrentCoords } =
          MarqueeSelectionStore.getState();

        operation = null;
        setIsOpen(false);
        setStartCoords(null);
        setCurrentCoords(null);

        cancelAnimationFrame(rafID);
      };

      document.addEventListener("mousedown", handleMouseDown);
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return {
        destroy() {
          document.removeEventListener("mousedown", handleMouseDown);
          document.removeEventListener("mousemove", handleMouseMove);
          document.removeEventListener("mouseup", handleMouseUp);
        },
      };
    },
  });
};
