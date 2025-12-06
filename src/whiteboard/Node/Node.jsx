import { memo, useCallback, useRef } from "react";

// fix
import Editor from "../../editor/Editor.jsx";
// fix

import useNodes from "../../stores/useNodes";
import useMouse from "../../stores/useMouse";
import useSelection from "../../stores/useSelection";
import useTrees from "../../stores/useTrees.js";

import "./Node.css";

const Node = memo(({ nodeID }) => {
  const node = useNodes((state) => state.nodesMap[nodeID]);
  const isSingleSelected = useSelection(
    (state) => state.singleSelectedNode?.id === nodeID
  );
  // isMultiSelected?

  // debug: check on this seldomly
  // console.log("RENDER", node.id);

  const set_nodesTree = useTrees((state) => state.set_nodesTree);

  const set_mouseState = useMouse((state) => state.set_mouseState);
  const set_singleSelectedNode = useSelection(
    (state) => state.set_singleSelectedNode
  );

  const nodeRef = useRef(null);

  const handleMouseDown = useCallback(
    (e) => {
      // local elements of a component need this
      e.stopPropagation();

      // DEBUG: erase this later
      set_nodesTree([]);

      document.body.style.userSelect = "none";

      // idea: maybe I should allow propagation so that necessary functionalities are triggered
      // set mouse state
      set_mouseState("SINGLE_NODE_MOVE");
      // set single selected node
      set_singleSelectedNode(node);

      return;
    },
    [node, set_mouseState, set_singleSelectedNode, set_nodesTree]
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
        zIndex: 3,
        width: node.dimension.width,
        height: node.dimension.height,
        // idea: maybe this should be the way?
        // height: "unset",
        transform: `translate(${node.position.x}px, ${node.position.y}px)`,
        overflow: "hidden",
        transformOrigin: "0 0",
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        className="rotatable-node"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          // FIX: height MUST be set for some reason for rotation to work or else the Editor will be pushed to the side...
          height: "100%",
          padding: "16px",
          transformOrigin: "center center",
          overflow: "clip",
          transform: `rotate(${node.rotation}rad)`,
        }}
      >
        <Editor />
      </div>
    </div>
  );
});

export default Node;
