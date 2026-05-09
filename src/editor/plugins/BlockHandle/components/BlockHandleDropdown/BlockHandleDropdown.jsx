import { useEffect, useRef } from "react";
import { useStore } from "zustand";

import blockHandleStore from "../../stores/blockHandleStore";

import { removeInertFromNonPortal } from "../../../../../utils";

import "./BlockHandleDropdown.css";

// todo: tooltip
// todo: floating ui

const BlockHandleDropdown = () => {
  const { isHandleDropdownRendered, rect, resetBlockHandle } =
    useStore(blockHandleStore);

  const dropdownRef = useRef();

  useEffect(() => {
    // review: event attached to window with capture to true
    // review: set preventDefault and stopPropagation so that only this event is listened to
    const handleMouseDown = (e) => {
      if (dropdownRef.current) {
        e.preventDefault();

        const isOutside = !dropdownRef.current.contains(e.target);

        if (isOutside) {
          e.stopPropagation(); // idea: key

          removeInertFromNonPortal();

          resetBlockHandle();
        }
      }
    };

    window.addEventListener("mousedown", handleMouseDown, { capture: true });

    return () => {
      window.removeEventListener("mousedown", handleMouseDown, {
        capture: true,
      });
    };
  }, [resetBlockHandle]);

  if (isHandleDropdownRendered) {
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
          onMouseDown={() => {
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
  }
};

export default BlockHandleDropdown;
