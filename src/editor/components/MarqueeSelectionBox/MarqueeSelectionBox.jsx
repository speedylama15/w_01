import Flatbush from "flatbush";
import { useEffect, useRef, useState } from "react";
import { useCurrentEditor } from "@tiptap/react";

import { MultiBlockSelection } from "../../selections/MultiBlockSelection";

import "./MarqueeSelectionBox.css";

// todo: I can over engineer this and find the dom and the corresponding node
// idea: also, while marquee selecting, I don't want other elements to render
// idea: resize (table), block handle, I don't want them to show up
// review: when click outside the editor -> no window selection at all and visible
// review: when I click inside -> invisible

const MarqueeSelectionBox = () => {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [box, setBox] = useState(null);

  const editor = useCurrentEditor();

  const flatIndex = useRef();
  const blockDOMs = useRef([]);
  const startCoords = useRef(null);
  const currentCoords = useRef(null);

  useEffect(() => {
    if (!editor) return;

    const handleMouseDown = (e) => {
      // left button only
      if (e.button !== 0) return;

      // idea: maybe?
      // e.preventDefault();

      setIsMouseDown(true);

      const coords = { x: e.clientX, y: e.clientY + window.scrollY };

      startCoords.current = coords;
      currentCoords.current = coords;

      const blocks = editor.view.dom.querySelectorAll(".block");

      blockDOMs.current = [];
      flatIndex.current = new Flatbush(blocks.length);

      blocks.forEach((block) => {
        const rect = block.getBoundingClientRect();

        const minX = rect.left;
        const maxX = rect.right;
        const minY = rect.top + window.scrollY;
        const maxY = rect.bottom + window.scrollY;

        flatIndex.current.add(minX, minY, maxX, maxY);
        blockDOMs.current.push(block);
      });

      flatIndex.current.finish();
    };

    const handleMouseMove = (e) => {
      if (!isMouseDown) return;

      // e.preventDefault();
      // window.getSelection().removeAllRanges();

      currentCoords.current = { x: e.clientX, y: e.clientY + window.scrollY };

      const minX = Math.min(startCoords.current.x, currentCoords.current.x);
      const maxX = Math.max(startCoords.current.x, currentCoords.current.x);
      const minY = Math.min(startCoords.current.y, currentCoords.current.y);
      const maxY = Math.max(startCoords.current.y, currentCoords.current.y);

      const box = { minX, maxX, minY, maxY };
      setBox(box);

      // debug
      let shouldShowUpWhenPressedInEditor = false;

      const ids = flatIndex.current
        .search(minX, minY, maxX, maxY, (i) => {
          const dom = blockDOMs.current[i];
          const contentType = dom.getAttribute("data-content-type");

          if (contentType === "table") shouldShowUpWhenPressedInEditor = true;

          return true;
        })
        .sort((a, b) => a - b);

      console.log(shouldShowUpWhenPressedInEditor);

      // const ids = index.search(10, 10, 20, 20, (i) => items[i].foo === 'bar');

      if (ids.length === 0) return;

      const { dispatch } = editor.view;
      const { tr } = editor.view.state;

      if (ids.length === 1) {
        const anchorIndex = ids[0];
        const anchorBefore =
          editor.view.posAtDOM(blockDOMs.current[anchorIndex]) - 1;
        const anchorNode = editor.view.state.doc.nodeAt(anchorBefore);

        const multiSelection = MultiBlockSelection.create(
          tr.doc,
          anchorBefore,
          anchorBefore + anchorNode.nodeSize,
        );

        dispatch(tr.setSelection(multiSelection));
      }

      if (ids.length > 1) {
        const anchor = ids[0];
        const head = ids[ids.length - 1];

        const anchorBefore =
          editor.view.posAtDOM(blockDOMs.current[anchor]) - 1;
        const headBefore = editor.view.posAtDOM(blockDOMs.current[head]) - 1;
        const headNode = editor.view.state.doc.nodeAt(headBefore);
        const headAfter = headBefore + headNode.nodeSize;

        const multiSelection = MultiBlockSelection.create(
          tr.doc,
          anchorBefore,
          headAfter,
        );

        dispatch(tr.setSelection(multiSelection));
      }

      // e.preventDefault();
      window.getSelection().removeAllRanges();
    };

    const handleMouseUp = () => {
      setIsMouseDown(false);
      setBox(null);

      startCoords.current = null;
      currentCoords.current = null;
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [editor, isMouseDown, startCoords]);

  return (
    <>
      {isMouseDown && box && (
        <div
          style={{
            backgroundColor: "#96afde6b",
            border: "1px solid #004cff",
            position: "absolute",
            top: 0,
            left: 0,
            transform: `translate(${box.minX}px, ${box.minY}px)`,
            width: `${box.maxX - box.minX}px`,
            height: `${box.maxY - box.minY}px`,
            pointerEvents: "none",
          }}
        ></div>
      )}
    </>
  );
};

export default MarqueeSelectionBox;
