import { useEffect, useRef } from "react";
import { useStore } from "zustand";

import blockHandleStore from "../../stores/blockHandleStore";

import { removeInertFromNonPortal } from "../../../../../utils";

import "./BlockHandleDropdown.css";

// todo: tooltip
// todo: floating ui

// fix: when a block is deleted, how do I handle the rendering of the handle?
// if it's rendered and tr.docChanged happened in onTransaction. Then hide it until the mouse moves again?

const BlockHandleDropdown = () => {
  const { isClicked, rect, setIsClicked, setDOM, setRect } =
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
          e.stopPropagation(); // key

          removeInertFromNonPortal();
          setIsClicked(false);
          setDOM(null);
          setRect(null);
        }
      }
    };

    window.addEventListener("mousedown", handleMouseDown, { capture: true });

    return () => {
      window.removeEventListener("mousedown", handleMouseDown, {
        capture: true,
      });
    };
  }, [setIsClicked, setDOM, setRect]);

  return (
    <>
      {isClicked && (
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
      )}
    </>
  );
};

export default BlockHandleDropdown;
