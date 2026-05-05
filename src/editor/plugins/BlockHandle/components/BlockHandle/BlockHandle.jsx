import { useRef } from "react";
import { useCurrentEditor } from "@tiptap/react";
import { useStore } from "zustand";
import { MultiBlockSelection } from "../../../../selections/MultiBlockSelection";

import blockHandleStore from "../../stores/blockHandleStore";

import {
  isLeftClick,
  isDragging,
  setInertOnNonPortal,
  isInclusive,
} from "../../../../../utils";

import "./BlockHandle.css";
import { TextSelection } from "@tiptap/pm/state";

// todo: when block handle drag and drop is happening, hide the handle

const BlockHandle = () => {
  const editor = useCurrentEditor();

  const handleRef = useRef();

  const { dom, rect, setIsClicked, setIsDragged } = useStore(blockHandleStore);

  const mouseState = useRef("IDLE"); // fix: this needs to be a state

  const handleMouseDown = (e) => {
    e.preventDefault(); // prevent text selection
    e.stopPropagation(); // prevent mousedown from reaching document's mousedown

    if (!isLeftClick(e)) {
      e.preventDefault();

      return;
    }

    mouseState.current = "DOWN";
    const startCoords = { x: e.pageX, y: e.pageY };

    const move = (e) => {
      if (mouseState.current !== "DOWN" || mouseState !== "DRAG") return;

      const currentCoords = { x: e.pageX, y: e.pageY };

      if (mouseState.current === "DOWN") {
        mouseState.current = isDragging(startCoords, currentCoords, 5)
          ? "DRAG"
          : "DOWN";

        if (mouseState.current === "DRAG") setIsDragged(true);
      }

      if (mouseState.current === "DRAG") {
        // set operation to BLOCK_HANDLE_DRAG_AND_DROP
        // conduct drag and drop
      }
    };

    const up = () => {
      if (mouseState.current === "DOWN") {
        // make the proper Multi selection
        // open up the dropdown menu with the proper contextual data

        const { tr } = editor.view.state;
        const { dispatch } = editor.view;

        setInertOnNonPortal();

        const nodeBefore = editor.view.posAtDOM(dom) - 1;
        const node = editor.view.state.tr.doc.nodeAt(nodeBefore);
        const nodeAfter = nodeBefore + node.nodeSize;

        const sel = MultiBlockSelection.create(tr.doc, nodeBefore, nodeAfter);
        dispatch(tr.setSelection(sel));

        setIsClicked(true);
      }

      if (mouseState.current === "DRAG") {
        // insert the blocks at the right position
      }

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
};

export default BlockHandle;
