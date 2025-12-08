import { useRef } from "react";

import useMouse from "../../../stores/useMouse";
import useSelection from "../../../stores/useSelection";

import "./NodeRotator.css";

// todo: REMINDER -> NodeControls is NOT part of Node
const NodeRotator = ({ node }) => {
  const set_mouseState = useMouse((state) => state.set_mouseState);
  const set_singleSelectedNode = useSelection(
    (state) => state.set_singleSelectedNode
  );

  const rotatorRef = useRef();

  const handleMouseDown = (e) => {
    // local elements of a component need this
    e.stopPropagation();

    document.body.style.userSelect = "none";

    set_mouseState("SINGLE_NODE_ROTATE");
    // review: setting single selected on every click is SO important -> need updated value
    set_singleSelectedNode(node);
  };

  return (
    <div
      ref={rotatorRef}
      className="node-rotator"
      data-node-id={node.id}
      onMouseDown={handleMouseDown}
    />
  );
};

export default NodeRotator;
