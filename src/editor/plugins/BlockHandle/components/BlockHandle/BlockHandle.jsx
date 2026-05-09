import { useCallback, useEffect, useRef, memo } from "react";
import { useCurrentEditor } from "@tiptap/react";
import { useStore } from "zustand";
import { MultiBlockSelection } from "../../../../selections/MultiBlockSelection";
import { TextSelection } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { Fragment } from "@tiptap/pm/model";
import Flatbush from "flatbush";

import blockHandleStore from "../../stores/blockHandleStore";

import {
  isLeftClick,
  getIsDragging,
  setInertOnNonPortal,
  isInclusive,
} from "../../../../../utils";

import "./BlockHandle.css";

// todo: when block handle drag and drop is happening, hide the handle
// todo: I need raf
// todo: Identify the container of the editor and allow auto scrolling. In this case, it's the window, but in the whiteboard, that may change
// fix: return must be used after rafID has been assigned. That's why the loop was cutting off when result's length was 0

const IDLE = "IDLE";
const DOWN = "DOWN";
const DRAG = "DRAG";
const EDITOR_DRAG_AND_DROP = "EDITOR_DRAG_AND_DROP";

const getBlockData = (doc) => {
  const blockDOMs = document.querySelectorAll(".block");
  const tree = new Flatbush(blockDOMs.length);

  const doms = [];
  const nodes = [];

  blockDOMs.forEach((blockDOM) => {
    const rect = blockDOM.getBoundingClientRect();

    const minX = rect.left;
    const maxX = rect.right;
    const minY = rect.top + window.scrollY;
    const maxY = rect.bottom + window.scrollY;

    doms.push({ top: minY, right: maxX, bottom: maxY, left: minX });

    tree.add(minX, minY, maxX, maxY);
  });

  tree.finish();

  doc.descendants((node, pos) => {
    if (node.attrs.nodeType === "block") {
      nodes.push({ node, before: pos, after: pos + node.nodeSize });

      return false;
    }
  });

  return { tree, doms, nodes };
};

const setSelectionWithBlockHandle = (tr, before, after, selection) => {
  const isRangedTextSelection =
    selection instanceof TextSelection && selection.from !== selection.to;
  const isMultiBlockSelection = selection instanceof MultiBlockSelection;

  if (isRangedTextSelection || isMultiBlockSelection) {
    const { from, to } = selection;

    if (isInclusive(before, from, to) || isInclusive(after, from, to)) {
      const sel = MultiBlockSelection.create(
        tr.doc,
        Math.min(before, from),
        Math.max(after, to),
      );

      tr.setSelection(sel);
    } else {
      const sel = MultiBlockSelection.create(tr.doc, before, after);

      tr.setSelection(sel);
    }
  } else {
    const sel = MultiBlockSelection.create(tr.doc, before, after);

    tr.setSelection(sel);
  }
};

const canBeTargetForDrop = (selection, resultIndex, targetIndex) => {
  let bool = true;

  for (let i = 0; i < selection.nodes.length; i++) {
    const node = selection.nodes[i];
    const { index } = node;

    if (i === 0) {
      if (targetIndex === index - 1) {
        bool = false;
        break;
      }
    }

    if (index === targetIndex) {
      bool = false;
      break;
    }
  }

  return bool;
};

const BlockHandle = memo(() => {
  const editor = useCurrentEditor();

  console.log("BLOCK HANDLE"); // fix

  const { dom, rect, setIsLocked } = useStore(blockHandleStore);

  const handleRef = useRef();

  const mouseStateRef = useRef(IDLE);
  const mouseCoordsRef = useRef();
  const blockTreeRef = useRef();
  const blockDOMsRef = useRef();
  const blockNodesRef = useRef();
  const targetPosRef = useRef(null);
  const rafIDRef = useRef();

  const loop = useCallback(() => {
    console.log("loop");

    const { tr } = editor.view.state;
    const { dispatch } = editor.view;

    const { pageX, pageY, clientX, clientY } = mouseCoordsRef.current;

    if (clientY <= 5) window.scrollBy(0, -20);
    if (window.innerHeight - clientY <= 5) window.scrollBy(0, 20);

    if (!blockTreeRef.current) {
      const { tree, doms, nodes } = getBlockData(tr.doc);

      blockTreeRef.current = tree;
      blockDOMsRef.current = doms;
      blockNodesRef.current = nodes;
    }

    const tree = blockTreeRef.current;
    const doms = blockDOMsRef.current;
    const nodes = blockNodesRef.current;

    const result = tree.search(
      pageX - Infinity,
      pageY - 3,
      pageX + Infinity,
      pageY + 3,
    );

    if (!result.length) {
      tr.setMeta(EDITOR_DRAG_AND_DROP, DecorationSet.empty);
      targetPosRef.current = null;
      rafIDRef.current = requestAnimationFrame(loop); // review: crucial
      return;
    }

    const resultIndex = result[0];
    const blockDOM = doms[resultIndex]; // top, right, bottom, left
    const height = blockDOM.bottom - blockDOM.top;

    let direction = null;
    let targetIndex = null;
    let targetClass = null;

    if (pageY < blockDOM.top + height / 2) {
      direction = resultIndex === 0 ? "top" : "bottom";
      targetIndex = resultIndex === 0 ? 0 : resultIndex - 1;
      targetClass = resultIndex === 0 ? "top-line" : "bottom-line"; // fix: change name
    } else {
      direction = "bottom";
      targetIndex = resultIndex;
      targetClass = "bottom-line";
    }

    if (!canBeTargetForDrop(tr.selection, resultIndex, targetIndex)) {
      tr.setMeta(EDITOR_DRAG_AND_DROP, DecorationSet.empty);
      targetPosRef.current = null; // review: important
    } else {
      const { before, after } = nodes[targetIndex];

      const dec = Decoration.node(before, after, {
        class: targetClass,
      });

      tr.setMeta(EDITOR_DRAG_AND_DROP, DecorationSet.create(tr.doc, [dec]));

      targetPosRef.current = direction === "top" ? before : after;
    }

    dispatch(tr);

    rafIDRef.current = requestAnimationFrame(loop);
  }, [editor]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const { tr, selection } = editor.view.state;
    const { dispatch } = editor.view;

    setIsLocked(true);

    const startCoords = { x: e.pageX, y: e.pageY };

    const nodeBefore = editor.view.posAtDOM(dom) - 1;
    const node = tr.doc.nodeAt(nodeBefore);
    const nodeAfter = nodeBefore + node.nodeSize;

    setSelectionWithBlockHandle(tr, nodeBefore, nodeAfter, selection);
    dispatch(tr);

    mouseStateRef.current = DOWN;

    const move = (e) => {
      // console.log("handle move"); // fix

      const currentCoords = { x: e.pageX, y: e.pageY };

      mouseCoordsRef.current = {
        pageX: e.pageX,
        pageY: e.pageY,
        clientX: e.clientX,
        clientY: e.clientY,
      };

      if (mouseStateRef.current === DOWN) {
        const isDragging = getIsDragging(startCoords, currentCoords, 3);

        if (isDragging) mouseStateRef.current = DRAG;
      }

      if (mouseStateRef.current === DRAG) {
        if (!rafIDRef.current) {
          rafIDRef.current = requestAnimationFrame(loop);
        }
      }
    };

    const up = () => {
      const { tr, selection } = editor.view.state;
      const { dispatch } = editor.view;

      if (mouseStateRef.current === DRAG && targetPosRef.current !== null) {
        const { from, to } = selection;

        console.log("up", targetPosRef.current);

        tr.insert(targetPosRef.current, Fragment.from(selection.blocks));
        const sel = MultiBlockSelection.create(
          tr.doc,
          targetPosRef.current,
          targetPosRef.current + (to - from),
        );
        tr.setSelection(sel);
        tr.delete(tr.mapping.map(from), tr.mapping.map(to));
        tr.setMeta(EDITOR_DRAG_AND_DROP, DecorationSet.empty);

        dispatch(tr);
      }

      cancelAnimationFrame(rafIDRef.current);
      mouseStateRef.current = IDLE;
      blockTreeRef.current = null;
      blockDOMsRef.current = null;
      blockNodesRef.current = null;
      targetPosRef.current = null;
      rafIDRef.current = null;

      setIsLocked(false);

      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
    };

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  };

  return (
    <>
      {dom && (
        <div
          tabIndex="-1"
          className="block-handle"
          ref={handleRef}
          style={{
            position: "absolute",
            top: `${rect.y + window.scrollY}px`,
            left: `${rect.x}px`,
            transform: `translate(-120%, ${(18 * 1.6 - 25).toFixed(2) / 2}px)`,
          }}
          onMouseDown={handleMouseDown}
        />
      )}
    </>
  );
});

export default BlockHandle;
