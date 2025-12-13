import { useCallback } from "react";

import NodeHandle from "./NodeHandle/NodeHandle.jsx";

import useNodes from "../../stores/useNodes";
import useSelection from "../../stores/useSelection";

import NodeRotator from "./NodeRotator/NodeRotator.jsx";
import NodeResizer from "./NodeResizer/NodeResizer.jsx";
import useMouse from "../../stores/useMouse.js";
import useTrees from "../../stores/useTrees.js";

// todo: REMINDER -> NodeControls is NOT part of NODE
const NodeControls = () => {
  const selectedNodeID = useSelection((state) => state.singleSelectedNode?.id);
  const node = useNodes((state) => state.nodesMap[selectedNodeID]);

  const set_mouseState = useMouse((state) => state.set_mouseState);
  const set_singleSelectedNode = useSelection(
    (state) => state.set_singleSelectedNode
  );

  const set_nodesTree = useTrees((state) => state.set_nodesTree);

  const handleMouseDown = useCallback(
    (e) => {
      e.stopPropagation();

      document.body.style.userSelect = "none";

      set_mouseState("SINGLE_NODE_MOVE");
      set_singleSelectedNode(node);
      set_nodesTree(node);

      return;
    },
    [node, set_mouseState, set_singleSelectedNode, set_nodesTree]
  );

  return (
    node && (
      <div
        className="node-controls"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: `${node.dimension.width}px`,
          height: `${node.dimension.height}px`,
          transform: `translate(${node.position.x}px, ${node.position.y}px) rotate(${node.rotation}rad)`,
          // idea: z index of this should be +5 of the selected node's z index
          zIndex: 10,
        }}
        onMouseDown={handleMouseDown}
      >
        <NodeRotator node={node} />

        <NodeResizer node={node} location="top" />
        <NodeResizer node={node} location="right" />
        <NodeResizer node={node} location="bottom" />
        <NodeResizer node={node} location="left" />

        <NodeResizer node={node} location="top-left" />
        <NodeResizer node={node} location="top-right" />
        <NodeResizer node={node} location="bottom-left" />
        <NodeResizer node={node} location="bottom-right" />

        <NodeHandle node={node} location="top" />
        <NodeHandle node={node} location="right" />
        <NodeHandle node={node} location="bottom" />
        <NodeHandle node={node} location="left" />
      </div>
    )
  );
};

export default NodeControls;
