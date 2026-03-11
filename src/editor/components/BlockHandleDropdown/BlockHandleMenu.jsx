import { useRef, useEffect } from "react";
import { useStore } from "zustand";

import BlockHandleStore from "../../stores/BlockHandleStore";

import isLeftClick from "../../../utils/isLeftClick";

import "./BlockHandleMenu.css";

const BlockHandleMenu = () => {
  // needs to render contextually
  // identify the selected nodes
  // can fetch from MultiBlockSelection
  // this MUST be MultiBlockSelection

  const { rect, isMenuOpen, setIsDown, setIsMenuOpen } =
    useStore(BlockHandleStore);

  const ref = useRef();

  useEffect(() => {
    const handleMouseDown = (e) => {
      if (!isLeftClick(e)) return;

      setIsDown(false); // fix: change to isHandleDown

      if (ref.current && !ref.current.contains(e.target)) {
        setIsMenuOpen(false);

        const portal = document.querySelector(".portal");
        const parent = portal.parentNode;

        Array.from(parent.children).forEach((dom) => {
          if (dom !== portal) {
            dom.removeAttribute("inert");
            dom.style.overflow = "";
          }
        });

        document.body.style.overflow = "";
      }
    };

    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [setIsDown, setIsMenuOpen]);

  return (
    <>
      {isMenuOpen && (
        <div
          className="block-handle-menu"
          ref={ref}
          style={{
            position: "absolute",
            top: `${rect.top + window.scrollY}px`,
            left: `${rect.left}px`,
          }}
        >
          {/* idea: this is important */}
          <button>Custom Operations</button>

          <button>Copy</button>

          <button>Delete</button>
        </div>
      )}
    </>
  );
};

export default BlockHandleMenu;
