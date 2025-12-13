import { memo } from "react";

import useEdges from "../../../stores/useEdges";
import useMouse from "../../../stores/useMouse";
import useSelection from "../../../stores/useSelection";

import "./NodeHandle.css";

// todo: REMINDER -> NodeControls is NOT part of Node
const NodeHandle = memo(({ node, location }) => {
  const set_mouseState = useMouse((state) => state.set_mouseState);
  const set_singleSelectedNode = useSelection(
    (state) => state.set_singleSelectedNode
  );
  const set_newEdge = useEdges((state) => state.set_newEdge);

  const handleMouseDown = (e) => {
    e.stopPropagation();

    document.body.style.userSelect = "none";

    set_mouseState("EDGE_CREATE");
    set_singleSelectedNode(node);

    const edgeData = {
      sourceID: node.id,
      sourceLoc: location,
      targetID: null,
      targetLoc: null,
      // for mouse coords
      endCoord: null,
      localOffset: null,
    };

    set_newEdge(edgeData);

    return;
  };

  return (
    <div
      className="node-handle"
      data-handle-location={location}
      onMouseDown={handleMouseDown}
    />
  );
});

export default NodeHandle;
