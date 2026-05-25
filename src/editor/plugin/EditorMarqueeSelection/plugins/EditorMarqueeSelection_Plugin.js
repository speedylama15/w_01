import { Plugin, TextSelection } from "@tiptap/pm/state";

import editorMarqueeSelectionStore from "../stores/editorMarqueeSelectionStore";

import MultiSelection from "../../../selection/MultiSelection";

import { getIsDragging, isLeftClick, clamp } from "../../../../utils";
import { getBlocksData } from "../../../utils";

const IDLE = "IDLE";
const DOWN = "DOWN";
const DRAG = "DRAG";

// fix: when Marquee selection is happening or any other operation is happening, I do not want Block handle to be rendered
// fix: when it reaches a non-text node like divider, there's an error
// fix: the blue highlight needs to be removed when this starts
// fix: i feel like the ::after of Multi selection should have pointer events none

const EditorMarqueeSelection_Plugin = new Plugin({
  view(view) {
    let mouseState = IDLE;
    let rafID = null;
    let tree = null;
    let doms = null;
    let initScrollHeight = null;

    const loop = () => {
      const { tr } = view.state;
      const { dispatch } = view;

      const { startCoords, currentCoords, setCurrentCoords } =
        editorMarqueeSelectionStore.getState();

      const { clientY } = currentCoords;

      const MIN_SPEED = 3;
      const MAX_SPEED = 50;
      const UPPER_THRESHOLD = 30;
      const LOWER_THRESHOLD = window.innerHeight - 30;

      if (clientY <= 30) {
        const gap = UPPER_THRESHOLD - clientY;
        const t = gap / MAX_SPEED;
        const speed = Math.min(
          MIN_SPEED + t * (MAX_SPEED - MIN_SPEED),
          MAX_SPEED,
        );

        window.scrollBy(0, -speed);
      }

      if (window.innerHeight - clientY <= 30) {
        const gap = clientY - LOWER_THRESHOLD;
        const t = gap / MAX_SPEED;
        const speed = Math.min(
          MIN_SPEED + t * (MAX_SPEED - MIN_SPEED),
          MAX_SPEED,
        );

        window.scrollBy(0, speed);
      }

      const y = clientY + window.scrollY;
      const clampedY = clamp(y, 0, initScrollHeight);

      // calc the updated scrollY here
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
        const anchor = indexes[0];

        const before = view.posAtDOM(doms[anchor].dom) - 1;
        const node = view.state.doc.nodeAt(before);

        const selection = MultiSelection.create(
          tr.doc,
          before,
          before + node.nodeSize,
        );

        dispatch(tr.setSelection(selection));
      }

      if (indexes.length > 1) {
        const from = indexes[0];
        const to = indexes[indexes.length - 1];

        const fromBefore = view.posAtDOM(doms[from].dom) - 1;
        const toBefore = view.posAtDOM(doms[to].dom) - 1;
        const toNode = view.state.doc.nodeAt(toBefore);
        const toAfter = toBefore + toNode.nodeSize;

        const selection = MultiSelection.create(tr.doc, fromBefore, toAfter);

        dispatch(tr.setSelection(selection));
      }

      rafID = requestAnimationFrame(loop);
    };

    const handleMouseDown = (e) => {
      // I can't add e.preventDefault here because this mousedown is added to the document
      // and not to some local component like block handle
      if (!isLeftClick(e)) return;

      const { tr } = view.state;

      mouseState = DOWN;
      // need this to lock the y coord and to prevent the Box from stretching the page
      initScrollHeight = document.documentElement.scrollHeight;

      const data = getBlocksData(tr.doc);
      tree = data.tree;
      doms = data.doms;

      const { setStartCoords, setCurrentCoords } =
        editorMarqueeSelectionStore.getState();

      const contentDOM = document.querySelector(".editor-content");
      const sectionDOM = document.querySelector(".editor-section");

      // todo: I need add an editor container for auto scrolling
      if (!contentDOM?.contains(e.target) && sectionDOM?.contains(e.target)) {
        e.preventDefault();

        view.dom.blur(); // blur it out and set focus on up

        const startCoords = {
          clientX: e.clientX,
          clientY: e.clientY,
          pageX: e.pageX,
          pageY: e.pageY,
        };

        setStartCoords(startCoords);
        setCurrentCoords(startCoords);

        const move = (e) => {
          const currentCoords = {
            clientX: e.clientX,
            clientY: e.clientY,
            pageX: e.pageX,
            pageY: e.pageY,
          };

          setCurrentCoords(currentCoords);

          if (mouseState === DOWN) {
            const { startCoords, currentCoords } =
              editorMarqueeSelectionStore.getState();

            const isDragging = getIsDragging(
              startCoords,
              currentCoords,
              10,
              (obj) => obj.pageX,
              (obj) => obj.pageY,
            );

            if (isDragging) mouseState = DRAG;
          }

          if (mouseState === DRAG) {
            if (!rafID) rafID = requestAnimationFrame(loop);
          }
        };

        const up = (e) => {
          const { tr } = view.state;
          const { dispatch } = view;

          const { setStartCoords, setCurrentCoords } =
            editorMarqueeSelectionStore.getState();

          if (mouseState === DOWN) {
            const result = tree.search(
              e.pageX - Infinity,
              e.pageY - 3,
              e.pageX + Infinity,
              e.pageY + 3,
            );

            if (result.length > 0) {
              // set selection
              const index = result[0];
              const dom = doms[index].dom;

              const before = view.posAtDOM(dom) - 1;
              const $before = tr.doc.resolve(before);

              tr.setSelection(TextSelection.near($before));

              dispatch(tr);
            }
          }

          view.focus();

          if (rafID) cancelAnimationFrame(rafID);
          rafID = null;
          mouseState = IDLE;
          tree = null;
          doms = null;
          initScrollHeight = null;

          setStartCoords(null);
          setCurrentCoords(null);

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

export default EditorMarqueeSelection_Plugin;
