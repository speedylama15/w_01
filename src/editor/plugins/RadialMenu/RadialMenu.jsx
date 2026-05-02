import { useStore } from "zustand";
import { useEffect, useRef } from "react";

import { mainStore } from "../../../stores";
import radialMenuStore from "./radialMenuStore";

import "./RadialMenu.css";

// fix: must change the cursor, but url() needs the svg itself
const buttons = [
  {
    type: "default",
    text: "Default",
    icon: "D",
    operation: null,
    cursor: "default",
  },
  {
    type: "marquee",
    text: "Marquee",
    icon: "M",
    operation: "EDITOR_MARQUEE-SELECTION",
    cursor: "marquee",
  },
  {
    type: "dragAndDrop",
    text: "Drag and Drop",
    icon: "DnD",
    operation: "EDITOR_DRAG-AND-DROP",
    cursor: "drag-and-drop",
  },
  {
    type: "addition",
    text: "Addition",
    icon: "+",
    operation: "EDITOR_ADD-NODE",
    cursor: "default", // idea: this is key!
  },
];

// fix: rendering the menu can sometimes cause an overflow
// fix: make it look better
// idea: should I have the user hold the button down or should a simple click have the menu remain open?

const RadialMenu = () => {
  const { isRadialMenuOpen, setIsRadialMenuOpen, radialMenuCoords } =
    useStore(radialMenuStore);
  const { setOperation } = useStore(mainStore);

  const menuRef = useRef();

  useEffect(() => {
    if (!isRadialMenuOpen) return;

    const handlePointerDown = (e) => {
      const target = e.target;

      if (!menuRef.current) return;

      if (!menuRef.current.contains(target)) {
        setIsRadialMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isRadialMenuOpen, setIsRadialMenuOpen]);

  const handleOnClick = (e, operation, cursor) => {
    document.body.dataset.cursor = cursor;
    setOperation(operation);
    setIsRadialMenuOpen(false);
  };

  if (isRadialMenuOpen) {
    const { x, y } = radialMenuCoords;

    return (
      <div
        className="radial-menu"
        ref={menuRef}
        style={{ top: `${y}px`, left: `${x}px` }}
      >
        {buttons.map((button) => {
          return (
            <button
              key={`button-${button.type}`}
              onClick={(e) => handleOnClick(e, button.operation, button.cursor)}
            >
              <span>{button.icon}</span>

              {button.text}
            </button>
          );
        })}
      </div>
    );
  }
};

export default RadialMenu;
