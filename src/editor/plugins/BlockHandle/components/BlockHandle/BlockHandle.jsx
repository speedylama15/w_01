import { useRef } from "react";
import { useCurrentEditor } from "@tiptap/react";
import { useStore } from "zustand";

import { MultiBlockSelection } from "../../../../selections/MultiBlockSelection";

import blockHandleStore from "../../stores/blockHandleStore";

import { isLeftClick, setInertToPortalSiblings } from "../../../../../utils";

import "./BlockHandle.css";

const BlockHandle = () => {
  const editor = useCurrentEditor();

  const handleRef = useRef();

  const { isRendered, rect, setIsOpen, setIsLocked } =
    useStore(blockHandleStore);

  const handleMouseDown = (e) => {
    e.preventDefault(); // prevent text selection
    e.stopPropagation(); // prevent mousedown from reaching document's mousedown

    if (!isLeftClick(e)) return; // essential

    const { view } = editor;

    const elements = view.root.elementsFromPoint(e.clientX + 50, e.clientY);
    const block = elements.find((el) => el.classList.contains("block"));

    if (!block) return;

    const pos = view.posAtDOM(block) - 1;
    const node = view.state.doc.nodeAt(pos);

    const { tr } = editor.state;
    const { dispatch } = editor.view;

    const selection = MultiBlockSelection.create(
      tr.doc,
      pos,
      pos + node.nodeSize,
    );

    dispatch(tr.setSelection(selection));
    setInertToPortalSiblings();
    setIsOpen(true);
    setIsLocked(true);
  };

  return (
    <>
      {isRendered && (
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
