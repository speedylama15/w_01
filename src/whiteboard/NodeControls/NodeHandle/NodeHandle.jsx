import { memo } from "react";

import useApp from "../../../store/useApp";
import useEdge from "../../../store/useEdge";

import { getHandleCoords } from "../../../utils/getHandleCoords";

import "./NodeHandle.css";

// todo: REMINDER -> NodeControls is NOT part of Node
const NodeHandle = memo(({ node, handleLocation }) => {
  const handleCoords = getHandleCoords(node, handleLocation);

  const set_mouseState = useApp((state) => state.set_mouseState);
  const set_edgeData = useEdge((state) => state.set_edgeData);

  const handleMouseDown = (e) => {
    e.stopPropagation();

    set_mouseState("edge_create");
    set_edgeData({
      id: `edge-${Math.random()}`,
      sourceID: node.id,
      sourceLoc: handleLocation,
      targetID: null,
      targetLoc: null,
      targetXY: handleCoords,
      offset: 0,
    });
  };

  return (
    <div
      className="node-handle"
      data-handle-location={handleLocation}
      onMouseDown={handleMouseDown}
    />
  );
});

export default NodeHandle;
