import useNodes from "../../stores/useNodes";
import useSelection from "../../stores/useSelection";

import NodeRotator from "./NodeRotator/NodeRotator.jsx";
import NodeResizer from "./NodeResizer/NodeResizer.jsx";

// todo: REMINDER -> NodeControls is NOT part of NODE
const NodeControls = () => {
  const selectedNodeID = useSelection((state) => state.singleSelectedNode?.id);
  const node = useNodes((state) => state.nodesMap[selectedNodeID]);

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
          zIndex: 1,
        }}
      >
        <NodeRotator node={node} />

        <NodeResizer node={node} location={"top"} />
        <NodeResizer node={node} location={"right"} />
        <NodeResizer node={node} location={"bottom"} />
        <NodeResizer node={node} location={"left"} />

        <NodeResizer node={node} location={"top-left"} />
        <NodeResizer node={node} location={"top-right"} />
        <NodeResizer node={node} location={"bottom-left"} />
        <NodeResizer node={node} location={"bottom-right"} />
      </div>
    )
  );
};

export default NodeControls;
