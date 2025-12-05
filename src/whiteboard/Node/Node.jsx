import { memo, useCallback, useRef } from "react";

import useNodes from "../../stores/useNodes";
import useStartCoords from "../../stores/useStartCoords.js";
import usePanning from "../../stores/usePanning";
import useMouse from "../../stores/useMouse";
import useSelection from "../../stores/useSelection";
import useWrapperRect from "../../stores/useWrapperRect";

import { getWorldCoords } from "../../utils/getWorldCoords.js";

import "./Node.css";

const Node = memo(({ nodeID }) => {
  const node = useNodes((state) => state.nodesMap[nodeID]);

  const panOffsetCoords = usePanning((state) => state.panOffsetCoords);
  const scale = usePanning((state) => state.scale);
  const wrapperRect = useWrapperRect((state) => state.wrapperRect);

  const set_mouseState = useMouse((state) => state.set_mouseState);
  const set_startCoords = useStartCoords((state) => state.set_startCoords);
  const set_singleSelectedNode = useSelection(
    (state) => state.set_singleSelectedNode
  );

  const nodeRef = useRef(null);

  const handleMouseDown = useCallback(
    (e) => {
      // idea: maybe I should allow propagation so that necessary functionalities are triggered
      // set mouse state
      set_mouseState("SINGLE_NODE_MOVE");
      // set start coords
      set_startCoords(getWorldCoords(e, panOffsetCoords, scale, wrapperRect));
      // set single selected node
      set_singleSelectedNode(node);

      return;
    },
    [
      node,
      panOffsetCoords,
      scale,
      wrapperRect,
      set_mouseState,
      set_startCoords,
      set_singleSelectedNode,
    ]
  );

  return (
    <div
      ref={nodeRef}
      data-node-id={node.id}
      className="node"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 2,
        width: node.dimension.width,
        height: node.dimension.height,
        // idea: maybe this should be the way?
        // height: "unset",
        transform: `translate(${node.position.x}px, ${node.position.y}px)`,
        overflow: "visible",
        transformOrigin: "0 0",
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        className="rotatable-node"
        style={{
          backgroundColor: "#bbddffff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100%",
          padding: "16px",
          transformOrigin: "center center",
          overflow: "visible",
          transform: `rotate(${node.rotation}rad)`,
        }}
      >
        {/* DEBUG: fix later */}
        {/* todo: single instance of editor being shared */}
        <p>{node.content.html}</p>
        {/* <Editor node={node} /> */}
      </div>
    </div>
  );
});

export default Node;
