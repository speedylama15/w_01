import { Plugin, TextSelection } from "@tiptap/pm/state";

import { mainStore } from "../../../../stores";
import { editorMarqueeSelectionStore } from "../../../stores";

import { MultiBlockSelection } from "../../../selections/MultiBlockSelection";

import { isClickOrDrag, isLeftClick } from "../../../../utils";
import getEditorTree from "../utils/getEditorTree";

export const EditorMarqueeSelection_Plugin = () => {
  return new Plugin({
    view(view) {
      const handleMouseDown = (e) => {
        if (!isLeftClick(e)) return; // idea: essential

        const { setMouseState, setOperation } = mainStore.getState();
        const { setBothCoords } = editorMarqueeSelectionStore.getState();

        setMouseState("DOWN"); // idea: essential

        const contentDOM = document.querySelector(".editor-content");
        const pageDOM = document.querySelector(".editor-page");

        // clicked a specific location
        if (!contentDOM.contains(e.target) && pageDOM.contains(e.target)) {
          e.preventDefault();

          setBothCoords({
            clientX: e.clientX,
            clientY: e.clientY,
            pageX: e.pageX,
            pageY: e.pageY,
          });
          setOperation("IS_EDITOR_MARQUEE_SELECTION"); // can be EDITOR_MARQUEE_SELECTION

          view.focus();
        }
      };

      const handleMouseMove = (e) => {
        const { operation, mouseState, setOperation, setMouseState } =
          mainStore.getState();

        const {
          startCoords,
          editorTree,
          rafID,
          setCurrentCoords,
          setEditorTree,
          setEditorBlocks,
          setRafID,
        } = editorMarqueeSelectionStore.getState();

        // idea: essential -> do nothing if the mouse is "IDLE"
        if (mouseState === "IDLE") return;

        // will this become Marquee selection or end as a simple click?
        if (operation === "IS_EDITOR_MARQUEE_SELECTION") {
          const coords = {
            clientX: e.clientX,
            clientY: e.clientY,
            pageX: e.pageX,
            pageY: e.pageY,
          };

          setCurrentCoords(coords);

          const currentCoords =
            editorMarqueeSelectionStore.getState().currentCoords;

          // it can bounce back between click or drag depending on the the distance
          const state = isClickOrDrag(
            startCoords,
            currentCoords,
            20,
            (obj) => {
              return obj.pageX;
            },
            (obj) => {
              return obj.pageY;
            },
          );

          console.log(state);

          // but once it becomes "drag" -> set operation to "EDITOR_MARQUEE_SELECTION"
          if (state === "drag") {
            setOperation("EDITOR_MARQUEE_SELECTION");
            setMouseState("DRAG");
          }
        }

        if (operation === "EDITOR_MARQUEE_SELECTION") {
          const coords = {
            clientX: e.clientX,
            clientY: e.clientY,
            pageX: e.pageX,
            pageY: e.pageY,
          };

          setCurrentCoords(coords);

          // establish flatTree ONCE
          if (editorTree === null) {
            const { blocks, tree } = getEditorTree(view);

            // fix: better naming convention?
            setEditorBlocks(blocks);
            setEditorTree(tree);
          }

          // establish animation frame ONCE
          if (rafID === null) {
            const { tr } = view.state;
            const { dispatch } = view;

            const onFrameScrollY = () => {
              const {
                currentCoords,
                setCurrentCoords,
                editorTree,
                editorBlocks,
              } = editorMarqueeSelectionStore.getState();

              // if it's NOT at the top then scroll
              if (currentCoords?.clientY <= 20 && window.scrollY > 0) {
                // clientX remains the same
                // only the scrollY changes
                const coords = {
                  ...currentCoords,
                  pageY: currentCoords.clientY + window.scrollY - 5,
                };

                setCurrentCoords(coords);

                // fix: better this
                window.scrollBy(0, -5);
              }

              // if it's not at the bottom then scroll
              if (
                window.innerHeight - currentCoords?.clientY <= 20 &&
                window.scrollY + window.innerHeight < document.body.scrollHeight
              ) {
                const coords = {
                  ...currentCoords,
                  pageY: currentCoords.clientY + window.scrollY + 5,
                };

                setCurrentCoords(coords);

                // fix: better this
                window.scrollBy(0, 5);
              }

              // obtain fresh data
              // each frame, query overlapping nodes
              const s = editorMarqueeSelectionStore.getState().startCoords;
              const c = editorMarqueeSelectionStore.getState().currentCoords;

              const minX = Math.min(s.pageX, c.pageX);
              const maxX = Math.max(s.pageX, c.pageX);
              const minY = Math.min(s.pageY, c.pageY);
              const maxY = Math.max(s.pageY, c.pageY);

              const indexes = editorTree
                .search(minX, minY, maxX, maxY)
                .sort((a, b) => a - b);

              if (indexes.length === 0) {
                const multiSelection = MultiBlockSelection.create(tr.doc, 0, 0);

                dispatch(tr.setSelection(multiSelection));
              }

              if (indexes.length === 1) {
                const anchorIndex = indexes[0];
                const anchorBefore =
                  view.posAtDOM(editorBlocks[anchorIndex]) - 1;
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

                const anchorBefore = view.posAtDOM(editorBlocks[anchor]) - 1;
                const headBefore = view.posAtDOM(editorBlocks[head]) - 1;
                const headNode = view.state.doc.nodeAt(headBefore);
                const headAfter = headBefore + headNode.nodeSize;

                const multiSelection = MultiBlockSelection.create(
                  tr.doc,
                  anchorBefore,
                  headAfter,
                );

                dispatch(tr.setSelection(multiSelection));
              }

              setRafID(requestAnimationFrame(onFrameScrollY));
            };

            setRafID(requestAnimationFrame(onFrameScrollY));
          }
        }
      };

      const handleMouseUp = () => {
        const { mouseState, operation, setOperation, setMouseState } =
          mainStore.getState();

        const {
          rafID,
          setBothCoords,
          setEditorTree,
          setEditorBlocks,
          setRafID,
        } = editorMarqueeSelectionStore.getState();

        // do nothing if the mouse is "IDLE"
        if (mouseState === "IDLE") return;

        if (operation === "IS_EDITOR_MARQUEE_SELECTION") {
          // lose focus on the editor
          view.dom.blur();
          setOperation(null);
          setMouseState("IDLE");
        }

        if (operation === "EDITOR_MARQUEE_SELECTION") {
          view.focus();

          // reset
          // fix: need a better reset
          setOperation(null);
          cancelAnimationFrame(rafID); // need this
          setBothCoords(null);
          setEditorTree(null);
          setEditorBlocks(null);
          setRafID(null);
          setMouseState("IDLE");
        }
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
