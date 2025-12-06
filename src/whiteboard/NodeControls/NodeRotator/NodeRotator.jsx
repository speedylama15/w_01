import { useRef } from "react";

import useMouse from "../../../stores/useMouse";
import useSelection from "../../../stores/useSelection";
import useTrees from "../../../stores/useTrees";

import "./NodeRotator.css";

const NodeRotator = ({ node }) => {
  const set_nodesTree = useTrees((state) => state.set_nodesTree);

  const set_mouseState = useMouse((state) => state.set_mouseState);
  const set_singleSelectedNode = useSelection(
    (state) => state.set_singleSelectedNode
  );

  const rotatorRef = useRef();

  const handleMouseDown = (e) => {
    // local elements of a component need this
    e.stopPropagation();

    // DEBUG: erase this later
    set_nodesTree([]);

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
