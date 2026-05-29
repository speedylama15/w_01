import { Plugin, TextSelection } from "@tiptap/pm/state";
import MultiSelection from "../../selection/MultiSelection";

import { trackActivityKey } from "../trackActivity/trackActivity";

import marqueeSelectionStore from "./marqueeSelectionStore";

import { getIsDragging, isPureLeftClick, clamp } from "../../../utils";
import { getBlocksData, verticalAutoScroll } from "../../utils";

const IDLE = "IDLE";
const DOWN = "DOWN";
const DRAG = "DRAG";
const MARQUEE_SELECTION_CLICK = "MARQUEE_SELECTION_CLICK";
const MARQUEE_SELECTION_DRAG = "MARQUEE_SELECTION_DRAG";

const marqueeSelection = new Plugin({
  view(view) {
    let rafID = null;
    let tree = null;
    let nodes = null;
    let initScrollHeight = null;

    const loop = () => {
      const { tr } = view.state;
      const { dispatch } = view;

      const { startCoords, currentCoords, setCurrentCoords } =
        marqueeSelectionStore.getState();
      const { clientY } = currentCoords;

      verticalAutoScroll(clientY);

      // 0 to the full height of an element (the window)
      const clampedY = clamp(clientY + window.scrollY, 0, initScrollHeight);
      setCurrentCoords({
        ...currentCoords,
        pageY: clampedY,
      });

      const minX = Math.min(startCoords.pageX, currentCoords.pageX);
      const maxX = Math.max(startCoords.pageX, currentCoords.pageX);
      const minY = Math.min(startCoords.pageY, clampedY);
      const maxY = Math.max(startCoords.pageY, clampedY);

      const indexes = tree.search(minX, minY, maxX, maxY).sort((a, b) => a - b);

      if (indexes.length === 0) {
        const multiSelection = MultiSelection.create(tr.doc, 0, 0);

        dispatch(tr.setSelection(multiSelection));
      }

      if (indexes.length === 1) {
        const { before, after } = nodes[indexes[0]];

        const selection = MultiSelection.create(tr.doc, before, after);

        dispatch(tr.setSelection(selection));
      }

      if (indexes.length > 1) {
        const { before: from } = nodes[indexes[0]];
        const { after: to } = nodes[indexes[indexes.length - 1]];

        const selection = MultiSelection.create(tr.doc, from, to);

        dispatch(tr.setSelection(selection));
      }

      rafID = requestAnimationFrame(loop);
    };

    const handleMouseDown = (e) => {
      // idea
      if (!isPureLeftClick(e)) return;
      // idea
      const { operation } = trackActivityKey.getState(view.state);
      if (operation) return;

      const { tr } = view.state;
      const { dispatch } = view;

      const data = getBlocksData(tr.doc);
      tree = data.tree;
      nodes = data.nodes;
      // scrollHeight gives me full height of an element including the non-visible area
      initScrollHeight = document.documentElement.scrollHeight;

      const { setStartCoords, setCurrentCoords } =
        marqueeSelectionStore.getState();

      // review: identify the container of the editor, that's where the scrolling will occur. Right now it's the window
      const contentDOM = document.querySelector(".editor-content");
      const sectionDOM = document.querySelector(".editor-section");

      if (!contentDOM?.contains(e.target) && sectionDOM?.contains(e.target)) {
        // met the condition to start marquee selection
        e.preventDefault();

        // idea: set the operation
        dispatch(
          tr.setMeta("trackOperation", { operation: MARQUEE_SELECTION_CLICK }),
        );

        // blur the editor
        view.dom.blur();

        const startCoords = {
          clientX: e.clientX,
          clientY: e.clientY,
          pageX: e.pageX,
          pageY: e.pageY,
        };

        setStartCoords(startCoords);
        setCurrentCoords(startCoords);

        // review: suprisingly I can get the updated state immediately
        // console.log("DOWN", trackActivityKey.getState(view.state)); // fix

        const move = (e) => {
          const { tr } = view.state;
          const { dispatch } = view;

          // console.log("MOVE", trackActivityKey.getState(view.state)); // fix

          const { operation } = trackActivityKey.getState(view.state);

          const currentCoords = {
            clientX: e.clientX,
            clientY: e.clientY,
            pageX: e.pageX,
            pageY: e.pageY,
          };

          setCurrentCoords(currentCoords);

          if (operation === MARQUEE_SELECTION_CLICK) {
            const isDragging = getIsDragging(
              startCoords,
              currentCoords,
              10,
              (obj) => obj.pageX,
              (obj) => obj.pageY,
            );

            if (isDragging) {
              dispatch(
                tr.setMeta("trackOperation", {
                  operation: MARQUEE_SELECTION_DRAG,
                }),
              );
            }
          }

          if (operation === MARQUEE_SELECTION_DRAG && !rafID) {
            rafID = requestAnimationFrame(loop);
          }
        };

        const up = (e) => {
          const { tr } = view.state;
          const { dispatch } = view;

          const { operation } = trackActivityKey.getState(view.state);

          const { setStartCoords, setCurrentCoords } =
            marqueeSelectionStore.getState();

          if (operation === MARQUEE_SELECTION_CLICK) {
            const result = tree.search(
              e.pageX - Infinity,
              e.pageY - 3,
              e.pageX + Infinity,
              e.pageY + 3,
            );

            if (result.length > 0) {
              // set selection
              const index = result[0];
              const { before } = nodes[index];
              const $before = tr.doc.resolve(before);

              dispatch(tr.setSelection(TextSelection.near($before)));
            }
          }

          view.focus();

          if (rafID) cancelAnimationFrame(rafID);
          rafID = null;
          tree = null;
          nodes = null;
          initScrollHeight = null;
          setStartCoords(null);
          setCurrentCoords(null);
          dispatch(tr.setMeta("trackOperation", { operation: null }));

          document.removeEventListener("mousemove", move);
          document.removeEventListener("mouseup", up);
        };

        document.addEventListener("mousemove", move);
        document.addEventListener("mouseup", up);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);

    return {
      destroy() {
        document.removeEventListener("mousedown", handleMouseDown);
      },
    };
  },
});

export default marqueeSelection;
