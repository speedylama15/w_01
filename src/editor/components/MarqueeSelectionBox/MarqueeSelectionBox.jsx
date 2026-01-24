import RBush from "rbush";
import { useEffect, useRef, useState } from "react";
import { useCurrentEditor } from "@tiptap/react";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

import "./MarqueeSelectionBox.css";
import { MultiBlockSelection } from "../../selections/MultiBlockSelection";

// todo: I can over engineer this and find the dom and the corresponding node

const MarqueeSelectionBox = () => {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [box, setBox] = useState(null);

  const editor = useCurrentEditor();

  const treeRef = useRef(new RBush());
  const startCoords = useRef(null);
  const currentCoords = useRef(null);

  useEffect(() => {
    if (!editor) return;

    const handleMouseDown = (e) => {
      // fix: only right mouse button
      //   e.preventDefault();

      setIsMouseDown(true);

      const coords = { x: e.clientX, y: e.clientY + window.scrollY };

      startCoords.current = coords;
      currentCoords.current = coords;

      const arr = [];
      const blocks = editor.view.dom.querySelectorAll(".block");

      blocks.forEach((block) => {
        const rect = block.getBoundingClientRect();

        const minX = rect.left;
        const maxX = rect.right;
        const minY = rect.top + window.scrollY;
        const maxY = rect.bottom + window.scrollY;

        arr.push({ minX, maxX, minY, maxY, dom: block });
      });

      treeRef.current.load(arr);
    };

    const handleMouseMove = (e) => {
      if (!isMouseDown) return;

      currentCoords.current = { x: e.clientX, y: e.clientY + window.scrollY };

      const minX = Math.min(startCoords.current.x, currentCoords.current.x);
      const maxX = Math.max(startCoords.current.x, currentCoords.current.x);
      const minY = Math.min(startCoords.current.y, currentCoords.current.y);
      const maxY = Math.max(startCoords.current.y, currentCoords.current.y);

      const box = { minX, maxX, minY, maxY };

      const result = treeRef.current.search(box);

      if (result.length === 0) return;

      const { dispatch } = editor.view;
      const { tr } = editor.view.state;

      if (result.length === 1) {
        const anchor = result[0];
        const anchorBefore = editor.view.posAtDOM(anchor.dom) - 1;

        const multiSelection = MultiBlockSelection.create(tr.doc, anchorBefore);

        dispatch(tr.setSelection(multiSelection));
      }

      if (result.length > 1) {
        const anchor = result[0];
        const head = result[result.length - 1];

        // fix: the returned result is not in order...
        // fix: maybe I need to use flatbrush?
        const anchorBefore = editor.view.posAtDOM(anchor.dom) - 1;
        const headBefore = editor.view.posAtDOM(head.dom) - 1;
        const headNode = editor.view.state.doc.nodeAt(headBefore);
        const headAfter = headBefore + headNode.nodeSize;

        const multiSelection = MultiBlockSelection.create(tr.doc, 0, 15);

        console.log(anchorBefore, headAfter, multiSelection);

        dispatch(tr.setSelection(multiSelection));
      }

      setBox(box);
    };

    const handleMouseUp = () => {
      setIsMouseDown(false);
      setBox(null);

      startCoords.current = null;
      currentCoords.current = null;
      treeRef.current.clear();
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
            backgroundColor: "#ffffff6b",
            border: "1px solid #000",
            position: "absolute",
            top: 0,
            left: 0,
            transform: `translate(${box.minX}px, ${box.minY}px)`,
            width: `${box.maxX - box.minX}px`,
            height: `${box.maxY - box.minY}px`,
          }}
        ></div>
      )}
    </>
  );
};

export default MarqueeSelectionBox;
