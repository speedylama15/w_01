import { useEffect, useRef } from "react";
import { useCurrentEditor } from "@tiptap/react";
import { useStore } from "zustand";
import { TextSelection } from "@tiptap/pm/state";

import BlockHandleStore from "../../stores/BlockHandleStore";

import { MultiBlockSelection } from "../../selections/MultiBlockSelection";

import isLeftClick from "../../../utils/isLeftClick";

import "./BlockHandle.css";

const BlockHandle = () => {
  const editor = useCurrentEditor();

  const handleRef = useRef();
  const startCoords = useRef(null);
  const currentCoords = useRef(null);

  const {
    isOpen,
    isDown,
    isDragging,
    isMenuOpen,
    rect,
    setIsDown,
    setIsDragging,
    setIsMenuOpen,
  } = useStore(BlockHandleStore);

  const handleMouseDown = (e) => {
    e.preventDefault(); // prevent text selection
    e.stopPropagation(); // review: prevent mousedown from reaching document's mousedown

    if (!isLeftClick(e)) return;

    console.log("HANDLE MOUSEDOWN", isMenuOpen); // fix

    if (isMenuOpen) return;

    startCoords.current = { x: e.pageX, y: e.pageY };

    const elements = editor.view.root.elementsFromPoint(
      e.clientX + 50,
      e.clientY,
    );

    const block = elements.find((el) => el.classList.contains("block"));

    if (!block) return;

    const before = editor.view.posAtDOM(block) - 1;
    const node = editor.state.doc.nodeAt(before);
    const after = before + node.nodeSize;
    const start = before + 1;
    const end = after - 1;

    const { selection, tr } = editor.state;
    const { dispatch } = editor.view;

    let newSelection = selection;

    // ranged TextSelection that overlaps with start and end of the node is all that matters
    if (
      selection instanceof TextSelection &&
      selection.from !== selection.to &&
      selection.from < end &&
      selection.to > start
    ) {
      const from = Math.min(start, selection.from, selection.to);
      const to = Math.max(end, selection.from, selection.to);

      newSelection = MultiBlockSelection.create(tr.doc, from, to);
    } else {
      newSelection = MultiBlockSelection.create(tr.doc, before, after);
    }

    dispatch(tr.setSelection(newSelection));

    setIsDown(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (startCoords.current === null) return;

      currentCoords.current = { x: e.pageX, y: e.pageY };

      const distance =
        Math.pow(Math.abs(currentCoords.current.x - startCoords.current.x), 2) +
        Math.pow(Math.abs(currentCoords.current.y - startCoords.current.y), 2);

      if (distance > 25) {
        setIsDragging(true);
      }
    };

    const handleMouseUp = () => {
      console.log("HANDLE MOUSE UP", { isDown, isDragging, isMenuOpen }); // fix

      // mouse was down but did not drag
      if (isDown && !isMenuOpen && !isDragging) {
        // render dropdown
        const portal = document.querySelector(".portal");
        const parent = portal.parentNode;

        Array.from(parent.children).forEach((dom) => {
          if (dom !== portal) {
            dom.setAttribute("inert", "");
            dom.style.overflow = "hidden";
          }
        });

        document.body.style.overflow = "hidden";

        setIsMenuOpen(true);
      }

      // isDragging is set in mouse move
      // if true, alter the editor's content
      if (isDragging) {
        // this is place to alter the editor data
        // maybe in mouse move I can identify if the block/s can be placed or not

        setIsDragging(false);
      }

      startCoords.current = null;
      currentCoords.current = null;
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDown, isDragging, isMenuOpen, setIsMenuOpen, setIsDragging]);

  return (
    <>
      {isOpen && (
        <div
          tabIndex="-1"
          className="block-handle"
          ref={handleRef}
          style={{
            position: "absolute",
            top: `${rect.y + window.scrollY}px`,
            left: `${rect.x}px`,
            // fix: line-height and font-size
            transform: `translate(-120%, ${(18 * 1.6 - 25).toFixed(2) / 2}px)`,
          }}
          onMouseDown={handleMouseDown}
        />
      )}
    </>
  );
};

export default BlockHandle;
