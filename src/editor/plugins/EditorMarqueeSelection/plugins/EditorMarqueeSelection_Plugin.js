import { Plugin, TextSelection } from "@tiptap/pm/state";

import { mainStore } from "../../../../stores";
import editorMarqueeSelectionStore from "../stores/editorMarqueeSelectionStore";

import { MultiBlockSelection } from "../../../selections/MultiBlockSelection";

import { clamp, isClickOrDrag, isLeftClick } from "../../../../utils";
import getEditorTree from "../utils/getEditorTree";

import {
  IS_EDITOR_MARQUEE_SELECTION,
  EDITOR_MARQUEE_SELECTION,
} from "../operations";

// todo: convert this to a constant
const IDLE = "IDLE";
const DOWN = "DOWN";
const DRAG = "DRAG";
// todo: convert this to a constant

const EditorMarqueeSelection_Plugin = () => {
  return new Plugin({
    view(view) {
      const handleMouseDown = (e) => {
        if (!isLeftClick(e)) return; // idea: essential

        const { tr } = view.state;
        const { dispatch } = view;

        const { setMouseState, setOperation } = mainStore.getState();

        const { setStartCoords, setCurrentCoords } =
          editorMarqueeSelectionStore.getState();

        setMouseState(DOWN); // idea: essential

        const contentDOM = document.querySelector(".editor-content");
        const pageDOM = document.querySelector(".editor-page");

        // clicked a specific location
        if (!contentDOM.contains(e.target) && pageDOM.contains(e.target)) {
          e.preventDefault();

          const selection = MultiBlockSelection.create(tr.doc, 0, 0);
          dispatch(tr.setSelection(selection));
          view.focus();

          const coords = {
            clientX: e.clientX,
            clientY: e.clientY,
            pageX: e.pageX,
            pageY: e.pageY,
          };

          setStartCoords(coords);
          setCurrentCoords(coords);
          setOperation(IS_EDITOR_MARQUEE_SELECTION);
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
        if (mouseState === IDLE) return;

        // will this become Marquee selection or end as a simple click?
        if (operation === IS_EDITOR_MARQUEE_SELECTION) {
          const coords = {
            clientX: e.clientX,
            clientY: e.clientY,
            pageX: e.pageX,
            pageY: e.pageY,
          };

          setCurrentCoords(coords);

          // it can bounce back between click or drag depending on the the distance
          const state = isClickOrDrag(
            startCoords,
            coords,
            12,
            (obj) => {
              return obj.pageX;
            },
            (obj) => {
              return obj.pageY;
            },
          );

          // but once it becomes "drag" -> set operation to "EDITOR_MARQUEE_SELECTION"
          if (state === "drag") {
            setOperation(EDITOR_MARQUEE_SELECTION);
            setMouseState(DRAG);
          }
        }

        if (operation === EDITOR_MARQUEE_SELECTION) {
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
                editorTree,
                editorBlocks,
                setCurrentCoords,
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

                const base = 22;
                const distance = 0 - currentCoords.clientY;

                const value = base + distance;
                const speed = clamp(value, 5, 50);

                window.scrollBy(0, -speed);
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

                const base = 22;
                const distance =
                  0 - (window.innerHeight - currentCoords?.clientY);

                const value = base + distance;
                const speed = clamp(value, 5, 50);

                window.scrollBy(0, speed);
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
                const anchor = indexes[0];

                const anchorBefore = view.posAtDOM(editorBlocks[anchor]) - 1;
                const anchorNode = view.state.doc.nodeAt(anchorBefore);

                const selection = MultiBlockSelection.create(
                  tr.doc,
                  anchorBefore,
                  anchorBefore + anchorNode.nodeSize,
                );

                dispatch(tr.setSelection(selection));
              }

              if (indexes.length > 1) {
                const anchor = indexes[0];
                const head = indexes[indexes.length - 1];

                const anchorBefore = view.posAtDOM(editorBlocks[anchor]) - 1;
                const headBefore = view.posAtDOM(editorBlocks[head]) - 1;
                const headNode = view.state.doc.nodeAt(headBefore);
                const headAfter = headBefore + headNode.nodeSize;

                const selection = MultiBlockSelection.create(
                  tr.doc,
                  anchorBefore,
                  headAfter,
                );

                dispatch(tr.setSelection(selection));
              }

              setRafID(requestAnimationFrame(onFrameScrollY));
            };

            setRafID(requestAnimationFrame(onFrameScrollY));
          }
        }
      };

      const handleMouseUp = () => {
        const { tr } = view.state;
        const { dispatch } = view;

        const { mouseState, operation, setOperation, setMouseState } =
          mainStore.getState();

        const { rafID, reset } = editorMarqueeSelectionStore.getState();

        // do nothing if the mouse is "IDLE"
        if (mouseState === IDLE) return;

        if (operation === IS_EDITOR_MARQUEE_SELECTION) {
          const selection = TextSelection.create(tr.doc, 1);
          dispatch(tr.setSelection(selection));
          view.dom.blur(); // lose focus

          setOperation(null); // idea: essential
          setMouseState(IDLE); // idea: essential
          reset();
        }

        if (operation === EDITOR_MARQUEE_SELECTION) {
          view.focus();

          cancelAnimationFrame(rafID); // need this
          setOperation(null); // idea: essential
          setMouseState(IDLE); // idea: essential
          reset();
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

export default EditorMarqueeSelection_Plugin;
