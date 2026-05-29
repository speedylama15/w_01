import { useEffect, useRef } from "react";
import { useStore } from "zustand";
import { useCurrentEditor } from "@tiptap/react";

import blockHandleStore from "../../blockHandleStore";

import { removeInertFromNonPortal } from "../../../../../utils";
import { DOWN } from "../../../../../constants";

import "./BlockHandleDropdown.css";

// todo: tooltip
// todo: floating ui
// todo: contextual menu

const BlockHandleDropdown = () => {
  const editor = useCurrentEditor();
  const { rect, setIsLocked, setShowDropdown, hideHandle } =
    useStore(blockHandleStore);

  const dropdownRef = useRef();

  useEffect(() => {
    const down = (e) => {
      console.log("WHY?");
      if (dropdownRef.current) {
        e.preventDefault();

        const { tr } = editor.view.state;
        const { dispatch } = editor.view;

        const isOutside = !dropdownRef.current.contains(e.target);

        if (isOutside) {
          e.stopPropagation();

          removeInertFromNonPortal();

          setIsLocked(false);
          setShowDropdown(false);
          hideHandle();

          editor.view.focus();

          tr.setMeta("trackOperation", { operation: null });
          tr.setMeta("trackMouseState", { mouseState: DOWN });

          dispatch(tr);
        }
      }
    };

    // set capture to be true so that this pointerdown has the highest priority
    // and this pointerdown is the only one that is listened to
    // fix: maybe I need to ensure that adding of an event occurs only once?
    window.addEventListener("pointerdown", down, { capture: true });

    return () => {
      window.removeEventListener("pointerdown", down, {
        capture: true,
      });
    };
  }, [editor, setShowDropdown, setIsLocked, hideHandle]);

  return (
    <div
      className="block-handle-dropdown"
      ref={dropdownRef}
      style={{
        position: "absolute",
        top: `${rect.top + window.scrollY}px`,
        left: `${rect.left}px`,
      }}
    >
      <button
        onPointerDown={() => {
          console.log("config");
        }}
      >
        Config
      </button>

      <button>Turn into</button>

      <button>Copy</button>

      <button>Duplicate</button>

      <button>Delete</button>
    </div>
  );
};

export default BlockHandleDropdown;
