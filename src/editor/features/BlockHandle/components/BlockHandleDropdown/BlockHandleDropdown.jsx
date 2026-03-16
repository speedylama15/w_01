import { useEffect, useRef } from "react";
import { useStore } from "zustand";

import blockHandleStore from "../../stores/blockHandleStore";

import { removeInertFromPortalSiblings } from "../../../../../utils";

import "./BlockHandleDropdown.css";

// todo: tooltip
// todo: floating ui
// todo: better ui
// todo: selected node config
// todo: selected node turn into

const BlockHandleDropdown = () => {
  const {
    isOpen,
    rect,
    // idea: essential -> node,
    setIsOpen,
    setIsLocked,
  } = useStore(blockHandleStore);

  const dropdownRef = useRef();

  useEffect(() => {
    const handleMouseDown = (e) => {
      if (!dropdownRef.current) return;

      const isOutside = !dropdownRef.current.contains(e.target);

      if (isOutside) {
        removeInertFromPortalSiblings();
        setIsOpen(false);
        setIsLocked(false);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [setIsOpen, setIsLocked]);

  return (
    <>
      {isOpen && (
        <div
          className="block-handle-dropdown"
          ref={dropdownRef}
          style={{
            position: "absolute",
            top: `${rect.top + window.scrollY}px`,
            left: `${rect.left}px`,
          }}
        >
          {/* node -> contextual */}
          <button>Config</button>

          {/* node -> contextual */}
          <button>Turn into</button>

          <button>Copy</button>

          <button>Duplicate</button>

          <button>Delete</button>
        </div>
      )}
    </>
  );
};

export default BlockHandleDropdown;
