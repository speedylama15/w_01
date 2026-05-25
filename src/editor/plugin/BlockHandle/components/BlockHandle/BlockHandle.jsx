import { useCallback, useEffect, useRef, memo } from "react";
import { useCurrentEditor } from "@tiptap/react";
import { useStore } from "zustand";
import { TextSelection } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { Fragment } from "@tiptap/pm/model";
import Flatbush from "flatbush";
import MultiSelection from "../../../../selection/MultiSelection";

import blockHandleStore from "../../stores/blockHandleStore";

import { getBlocksData } from "../../../../utils";
import {
  getIsDragging,
  setInertOnNonPortal,
  isInclusive,
  isLeftClick,
} from "../../../../../utils";

import "./BlockHandle.css";

// todo: Identify the container of the editor and allow auto scrolling. In this case, it's the window, but in the whiteboard, that may change
// todo: I need to scale the intensity of the scrolling

const IDLE = "IDLE";
const DOWN = "DOWN";
const DRAG = "DRAG";
const EDITOR_DRAG_AND_DROP = "EDITOR_DRAG_AND_DROP";

const setSelectionWithBlockHandle = (tr, before, after, selection) => {
  const isRangedTextSelection =
    selection instanceof TextSelection && selection.from !== selection.to;
  const isMultiSelection = selection instanceof MultiSelection;

  if (isRangedTextSelection || isMultiSelection) {
    const { from, to } = selection;

    if (isInclusive(before, from, to) || isInclusive(after, from, to)) {
      const sel = MultiSelection.create(
        tr.doc,
        Math.min(before, from),
        Math.max(after, to),
      );

      tr.setSelection(sel);
    } else {
      const sel = MultiSelection.create(tr.doc, before, after);

      tr.setSelection(sel);
    }
  } else {
    const sel = MultiSelection.create(tr.doc, before, after);

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

  // console.log("Block Handle"); // fix

  const { dom, rect, setIsLocked, setShowDropdown, hideHandle } =
    useStore(blockHandleStore);

  const handleRef = useRef();

  const mouseStateRef = useRef(IDLE);
  const mouseCoordsRef = useRef();
  const blockTreeRef = useRef();
  const blockDOMsRef = useRef();
  const blockNodesRef = useRef();
  const targetPosRef = useRef(null);
  const rafIDRef = useRef();

  // fix: I can use apply and set the plugin state to hide the rendered handle...
  useEffect(() => {
    if (!editor) return;

    const transaction = ({ transaction }) => {
      if (transaction.docChanged) hideHandle();
    };

    editor.on("transaction", transaction);
  }, [editor, hideHandle]);

  const loop = useCallback(() => {
    // console.log("loop"); // fix

    const { tr } = editor.view.state;
    const { dispatch } = editor.view;

    const { pageX, pageY, clientY } = mouseCoordsRef.current;

    // todo: improve this logic... (I think the better logic is inside Marquee selection?)
    // todo: I need to render the ghost or something...
    // todo: better handle the handle that is locked
    if (clientY <= 5) window.scrollBy(0, -20);
    if (window.innerHeight - clientY <= 5) window.scrollBy(0, 20);

    if (!blockTreeRef.current) {
      const { tree, doms, nodes } = getBlocksData(tr.doc);

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
      dispatch(tr);
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

    if (!isLeftClick(e)) return; // idea: essential

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

      if (mouseStateRef.current === DOWN) {
        // set inert
        setInertOnNonPortal();

        // render the dropdown
        setShowDropdown(true);
      }

      if (mouseStateRef.current === DRAG && targetPosRef.current !== null) {
        const { from, to } = selection;

        tr.insert(targetPosRef.current, Fragment.from(selection.blocks));
        const sel = MultiSelection.create(
          tr.doc,
          targetPosRef.current,
          targetPosRef.current + (to - from),
        );
        tr.setSelection(sel);
        tr.delete(tr.mapping.map(from), tr.mapping.map(to));
        tr.setMeta(EDITOR_DRAG_AND_DROP, DecorationSet.empty);

        dispatch(tr);

        setIsLocked(false);
      }

      cancelAnimationFrame(rafIDRef.current);
      mouseStateRef.current = IDLE;
      blockTreeRef.current = null;
      blockDOMsRef.current = null;
      blockNodesRef.current = null;
      targetPosRef.current = null;
      rafIDRef.current = null;

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

// import { useCallback, useEffect, useRef, memo } from "react";
// import { useCurrentEditor } from "@tiptap/react";
// import { useStore } from "zustand";
// import { TextSelection } from "@tiptap/pm/state";
// import { Decoration, DecorationSet } from "@tiptap/pm/view";
// import { Fragment } from "@tiptap/pm/model";
// import Flatbush from "flatbush";
// import MultiSelection from "../../../../selection/MultiSelection";

// import blockHandleStore from "../../stores/blockHandleStore";

// import { getBlocksData } from "../../../../utils";
// import {
//   getIsDragging,
//   setInertOnNonPortal,
//   isInclusive,
//   isLeftClick,
// } from "../../../../../utils";

// import "./BlockHandle.css";

// // todo: Identify the container of the editor and allow auto scrolling. In this case, it's the window, but in the whiteboard, that may change
// // todo: I need to scale the intensity of the scrolling

// const IDLE = "IDLE";
// const DOWN = "DOWN";
// const DRAG = "DRAG";
// const EDITOR_DRAG_AND_DROP = "EDITOR_DRAG_AND_DROP";

// const setSelectionWithBlockHandle = (tr, before, after, selection) => {
//   const isRangedTextSelection =
//     selection instanceof TextSelection && selection.from !== selection.to;
//   const isMultiSelection = selection instanceof MultiSelection;

//   if (isRangedTextSelection || isMultiSelection) {
//     const { from, to } = selection;

//     if (isInclusive(before, from, to) || isInclusive(after, from, to)) {
//       const sel = MultiSelection.create(
//         tr.doc,
//         Math.min(before, from),
//         Math.max(after, to),
//       );

//       tr.setSelection(sel);
//     } else {
//       const sel = MultiSelection.create(tr.doc, before, after);

//       tr.setSelection(sel);
//     }
//   } else {
//     const sel = MultiSelection.create(tr.doc, before, after);

//     tr.setSelection(sel);
//   }
// };

// const canBeTargetForDrop = (selection, resultIndex, targetIndex) => {
//   let bool = true;

//   for (let i = 0; i < selection.nodes.length; i++) {
//     const node = selection.nodes[i];
//     const { index } = node;

//     if (i === 0) {
//       if (targetIndex === index - 1) {
//         bool = false;
//         break;
//       }
//     }

//     if (index === targetIndex) {
//       bool = false;
//       break;
//     }
//   }

//   return bool;
// };

// const BlockHandle = memo(() => {
//   const editor = useCurrentEditor();

//   // console.log("Block Handle"); // fix

//   const { dom, rect, setIsLocked, setShowDropdown, hideHandle } =
//     useStore(blockHandleStore);

//   const handleRef = useRef();

//   const mouseStateRef = useRef(IDLE);
//   const mouseCoordsRef = useRef();
//   const blockTreeRef = useRef();
//   const blockDOMsRef = useRef();
//   const blockNodesRef = useRef();
//   const targetPosRef = useRef(null);
//   const rafIDRef = useRef();

//   // fix: I can use apply and set the plugin state to hide the rendered handle...
//   useEffect(() => {
//     if (!editor) return;

//     const transaction = ({ transaction }) => {
//       if (transaction.docChanged) hideHandle();
//     };

//     editor.on("transaction", transaction);
//   }, [editor, hideHandle]);

//   const loop = useCallback(() => {
//     // console.log("loop"); // fix

//     const { tr } = editor.view.state;
//     const { dispatch } = editor.view;

//     const { pageX, pageY, clientY } = mouseCoordsRef.current;

//     // todo: improve this logic... (I think the better logic is inside Marquee selection?)
//     // todo: I need to render the ghost or something...
//     // todo: better handle the handle that is locked
//     if (clientY <= 5) window.scrollBy(0, -20);
//     if (window.innerHeight - clientY <= 5) window.scrollBy(0, 20);

//     if (!blockTreeRef.current) {
//       const { tree, doms, nodes } = getBlocksData(tr.doc);

//       blockTreeRef.current = tree;
//       blockDOMsRef.current = doms;
//       blockNodesRef.current = nodes;
//     }

//     const tree = blockTreeRef.current;
//     const doms = blockDOMsRef.current;
//     const nodes = blockNodesRef.current;

//     const result = tree.search(
//       pageX - Infinity,
//       pageY - 3,
//       pageX + Infinity,
//       pageY + 3,
//     );

//     if (!result.length) {
//       tr.setMeta(EDITOR_DRAG_AND_DROP, DecorationSet.empty);
//       targetPosRef.current = null;
//       rafIDRef.current = requestAnimationFrame(loop); // review: crucial
//       dispatch(tr);
//       return;
//     }

//     const resultIndex = result[0];
//     const blockDOM = doms[resultIndex]; // top, right, bottom, left
//     const height = blockDOM.bottom - blockDOM.top;

//     let direction = null;
//     let targetIndex = null;
//     let targetClass = null;

//     if (pageY < blockDOM.top + height / 2) {
//       direction = resultIndex === 0 ? "top" : "bottom";
//       targetIndex = resultIndex === 0 ? 0 : resultIndex - 1;
//       targetClass = resultIndex === 0 ? "top-line" : "bottom-line"; // fix: change name
//     } else {
//       direction = "bottom";
//       targetIndex = resultIndex;
//       targetClass = "bottom-line";
//     }

//     if (!canBeTargetForDrop(tr.selection, resultIndex, targetIndex)) {
//       tr.setMeta(EDITOR_DRAG_AND_DROP, DecorationSet.empty);
//       targetPosRef.current = null; // review: important
//     } else {
//       const { before, after } = nodes[targetIndex];

//       const dec = Decoration.node(before, after, {
//         class: targetClass,
//       });
//       tr.setMeta(EDITOR_DRAG_AND_DROP, DecorationSet.create(tr.doc, [dec]));

//       targetPosRef.current = direction === "top" ? before : after;
//     }

//     dispatch(tr);

//     rafIDRef.current = requestAnimationFrame(loop);
//   }, [editor]);

//   const handleMouseDown = (e) => {
//     e.preventDefault();
//     e.stopPropagation();

//     if (!isLeftClick(e)) return; // idea: essential

//     const { tr, selection } = editor.view.state;
//     const { dispatch } = editor.view;

//     setIsLocked(true);

//     const startCoords = { x: e.pageX, y: e.pageY };

//     const nodeBefore = editor.view.posAtDOM(dom) - 1;
//     const node = tr.doc.nodeAt(nodeBefore);
//     const nodeAfter = nodeBefore + node.nodeSize;

//     setSelectionWithBlockHandle(tr, nodeBefore, nodeAfter, selection);
//     dispatch(tr);

//     mouseStateRef.current = DOWN;

//     const move = (e) => {
//       const currentCoords = { x: e.pageX, y: e.pageY };

//       mouseCoordsRef.current = {
//         pageX: e.pageX,
//         pageY: e.pageY,
//         clientX: e.clientX,
//         clientY: e.clientY,
//       };

//       if (mouseStateRef.current === DOWN) {
//         const isDragging = getIsDragging(startCoords, currentCoords, 3);

//         if (isDragging) mouseStateRef.current = DRAG;
//       }

//       if (mouseStateRef.current === DRAG) {
//         if (!rafIDRef.current) {
//           rafIDRef.current = requestAnimationFrame(loop);
//         }
//       }
//     };

//     const up = () => {
//       const { tr, selection } = editor.view.state;
//       const { dispatch } = editor.view;

//       if (mouseStateRef.current === DOWN) {
//         // set inert
//         setInertOnNonPortal();

//         // render the dropdown
//         setShowDropdown(true);
//       }

//       if (mouseStateRef.current === DRAG && targetPosRef.current !== null) {
//         const { from, to } = selection;

//         tr.insert(targetPosRef.current, Fragment.from(selection.blocks));
//         const sel = MultiSelection.create(
//           tr.doc,
//           targetPosRef.current,
//           targetPosRef.current + (to - from),
//         );
//         tr.setSelection(sel);
//         tr.delete(tr.mapping.map(from), tr.mapping.map(to));
//         tr.setMeta(EDITOR_DRAG_AND_DROP, DecorationSet.empty);

//         dispatch(tr);

//         setIsLocked(false);
//       }

//       cancelAnimationFrame(rafIDRef.current);
//       mouseStateRef.current = IDLE;
//       blockTreeRef.current = null;
//       blockDOMsRef.current = null;
//       blockNodesRef.current = null;
//       targetPosRef.current = null;
//       rafIDRef.current = null;

//       document.removeEventListener("mousemove", move);
//       document.removeEventListener("mouseup", up);
//     };

//     document.addEventListener("mousemove", move);
//     document.addEventListener("mouseup", up);
//   };

//   return (
//     <>
//       {dom && (
//         <div
//           tabIndex="-1"
//           className="block-handle"
//           ref={handleRef}
//           style={{
//             position: "absolute",
//             top: `${rect.y + window.scrollY}px`,
//             left: `${rect.x}px`,
//             transform: `translate(-120%, ${(18 * 1.6 - 25).toFixed(2) / 2}px)`,
//           }}
//           onMouseDown={handleMouseDown}
//         />
//       )}
//     </>
//   );
// });

// export default BlockHandle;
