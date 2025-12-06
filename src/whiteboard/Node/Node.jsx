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
  // isMultiSelected?

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

  // debug: check on this seldomly
  console.log("RENDER", node.id);

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
        height: node.dimension.height, // idea: unset
        transform: `translate(${node.position.x}px, ${node.position.y}px)`,
        transformOrigin: "0 0",
        padding: "24px",
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        style={{
          width: "100%",
          height: "100%", // FIX: height MUST be set for some reason for rotation to work or else the Editor will be pushed to the side...
          transform: `rotate(${node.rotation}rad)`,
          transformOrigin: "center",
          overflow: "clip",
        }}
      >
        <Editor />
      </div>
    </div>
  );
});

export default Node;
