import { memo, useRef } from "react";

import useNodes from "../../stores/useNodes";

import Editor from "../../editor/Editor.jsx";

import "./Node.css";

const Node = memo(({ nodeID }) => {
  const node = useNodes((state) => state.nodesMap[nodeID]);

  const nodeRef = useRef(null);

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
        <p>{node.content.html}</p>
        {/* <Editor node={node} /> */}
      </div>
    </div>
  );
});

export default Node;
