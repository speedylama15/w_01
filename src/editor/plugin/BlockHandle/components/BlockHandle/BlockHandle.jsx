import { useEffect, useRef, memo, useCallback } from "react";
import { useCurrentEditor } from "@tiptap/react";
import { useStore } from "zustand";
import MultiSelection from "../../../../selection/MultiSelection";

import blockHandleStore from "../../blockHandleStore";

import { getPosAtDOM } from "../../../../utils";
import { isPureLeftClick, setInertOnNonPortal } from "../../../../../utils";
import { IDLE, DOWN } from "../../../../../constants";

import "./BlockHandle.css";

const BlockHandle = memo(() => {
  const editor = useCurrentEditor();
  const { dom, rect, setIsLocked, setShowDropdown, hideHandle } =
    useStore(blockHandleStore);

  const handleRef = useRef();

  // hide the handle when there is a transaction
  useEffect(() => {
    if (!editor) return;

    const transaction = ({ transaction }) => {
      if (transaction.docChanged) hideHandle();
    };

    editor.on("transaction", transaction);

    return () => {
      editor.off("transaction", transaction);
    };
  }, [editor, hideHandle]);

  const down = useCallback(
    (e) => {
      if (!isPureLeftClick(e)) return;

      e.preventDefault();
      e.stopPropagation();

      const { tr } = editor.view.state;
      const { dispatch } = editor.view;

      setIsLocked(true);
      setShowDropdown(true);

      const before = getPosAtDOM(editor.view, dom);
      const node = editor.view.state.doc.nodeAt(before);
      const after = before + node.nodeSize;

      tr.setSelection(MultiSelection.create(tr.doc, before, after));
      tr.setMeta("trackOperation", { operation: "BLOCK_HANDLE_CLICK" });
      tr.setMeta("trackMouseState", { mouseState: DOWN });

      dispatch(tr);

      setInertOnNonPortal();
    },
    [editor, dom, setIsLocked, setShowDropdown],
  );

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
          onPointerDown={down}
        />
      )}
    </>
  );
});

export default BlockHandle;
