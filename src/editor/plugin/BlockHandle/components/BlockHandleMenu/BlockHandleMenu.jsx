import { useEffect, useRef } from "react";
import { useStore } from "zustand";
import { useCurrentEditor } from "@tiptap/react";

import blockHandleStore from "../../blockHandleStore";

import { removeInertFromNonPortal } from "../../../../../utils";
import { DOWN } from "../../../../../constants";

import "./BlockHandleMenu.css";

// todo: tooltip
// todo: floating ui
// todo: contextual menu

const BlockHandleMenu = () => {
  const editor = useCurrentEditor();
  const { rect, setIsLocked, setShowDropdown, hideHandle } =
    useStore(blockHandleStore);

  const dropdownRef = useRef();

  useEffect(() => {
    const down = (e) => {
      if (dropdownRef.current) {
        e.preventDefault();
        e.stopPropagation();

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

    // fix: maybe I need to ensure that adding of an event occurs only once?
    document.addEventListener("pointerdown", down, { capture: true });

    return () => {
      document.removeEventListener("pointerdown", down, {
        capture: true,
      });
    };
  }, [editor, setShowDropdown, setIsLocked, hideHandle]);

  return (
    <div
      className="block-handle-menu"
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

export default BlockHandleMenu;
