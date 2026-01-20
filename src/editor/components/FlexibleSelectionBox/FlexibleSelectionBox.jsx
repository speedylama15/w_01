import { useEffect, useRef, useState } from "react";

import { useCurrentEditor } from "@tiptap/react";

import "./FlexibleSelectionBox.css";
import RBush from "rbush";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

// todo: I can over engineer this and find the dom and the corresponding node

const FlexibleSelectionBox = () => {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [box, setBox] = useState(null);

  const editor = useCurrentEditor();

  const treeRef = useRef(new RBush());
  const startCoords = useRef(null);
  const currentCoords = useRef(null);

  useEffect(() => {
    if (!editor) return;

    const handleMouseDown = (e) => {
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

      const decorations = [];
      result.forEach((data) => {
        const pos = editor.view.posAtDOM(data.dom);
        const before = pos - 1;
        const node = editor.view.state.doc.nodeAt(before);
        const after = before + node.nodeSize;

        console.log("test", before);

        const dec = Decoration.node(before, after, { class: "woah" });
        decorations.push(dec);
      });

      const { dispatch } = editor.view;
      const { tr } = editor.view.state;

      // fix
      dispatch(tr.setMeta("woah", DecorationSet.create(tr.doc, decorations)));

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

export default FlexibleSelectionBox;
