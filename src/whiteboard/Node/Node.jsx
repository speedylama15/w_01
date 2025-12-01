import { memo, useEffect, useRef, useState } from "react";

import useNodes from "../../stores/useNodes";

// debug
import Editor from "../../editor/Editor.jsx";

import "./Node.css";

function drawShape(x, y, width, height) {
  return `
    M 0, 0
    L ${x + width}, 0
    L ${x + width}, ${y + height}
    L ${x}, ${y + height}
    Z
  `;

  // const cx = x + width / 2;
  // const cy = y + height / 2;
  // const rx = width / 2;
  // const ry = height / 2;

  // return `
  //   M ${cx - rx}, ${cy}
  //   A ${rx} ${ry} 0 0 1 ${cx + rx} ${cy}
  //   A ${rx} ${ry} 0 0 1 ${cx - rx} ${cy}
  //   Z
  // `;

  // const cx = x + width / 2;
  // const cy = y + height / 2;
  // const rx = width / 2;
  // const ry = height / 2;

  // return `
  //   M ${cx}, ${y}
  //   C ${cx + rx * 0.8}, ${y + ry * 0.3}, ${cx + rx * 0.9}, ${cy}, ${cx + rx}, ${cy}
  //   C ${cx + rx * 0.7}, ${cy + ry * 0.8}, ${cx + rx * 0.4}, ${cy + ry}, ${cx}, ${cy + ry}
  //   C ${cx - rx * 0.5}, ${cy + ry * 0.9}, ${cx - rx * 0.8}, ${cy + ry * 0.6}, ${cx - rx}, ${cy}
  //   C ${cx - rx * 0.9}, ${cy - ry * 0.4}, ${cx - rx * 0.6}, ${y + ry * 0.2}, ${cx}, ${y}
  //   Z
  // `;
}

const Node = memo(({ nodeID, handleClick }) => {
  console.log("render");
  const [pathData, setPathData] = useState("");

  const node = useNodes((state) => state.nodesMap[nodeID]);

  const nodeRef = useRef(null);
  const svgRef = useRef(null);
  const editableRef = useRef(null);

  const set_node = useNodes((state) => state.set_node);

  useEffect(() => {
    const path = drawShape(
      0,
      0,
      node.dimension.width,
      node.dimension.height,
      10
    );
    setPathData(path);
  }, [node.dimension.width, node.dimension.height]);

  return (
    <div
      ref={nodeRef}
      data-node-id={node.id}
      className="node"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 0,
        width: node.dimension.width,
        // height: node.dimension.height,
        // idea: maybe this should be the way?
        height: "unset",
        transform: `translate(${node.position.x}px, ${node.position.y}px)`,
        overflow: "visible",
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
        {/* <Editor node={node} xmlns="http://www.w3.org/1999/xhtml" /> */}
        <Editor node={node} />

        {/* <svg
          ref={svgRef}
          width={node.dimension.width}
          height={node.dimension.height}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 100,
            pointerEvents: "none",
          }}
          viewBox={`0 0 ${node.dimension.width} ${node.dimension.height}`}
        >
          <path d={pathData} stroke="#3acc00ff" fill="none" strokeWidth="3" />
        </svg> */}
      </div>
    </div>
  );
});

export default Node;

{
  /* <div
        className="node-controls"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          transform: `rotate(${node.rotation}rad)`,
        }}
      >
        <div className="node-resizer" data-location="top" />
        <div className="node-resizer" data-location="right" />
        <div className="node-resizer" data-location="bottom" />
        <div className="node-resizer" data-location="left" />
        <div className="node-resizer" data-location="top-left" />
        <div className="node-resizer" data-location="top-right" />
        <div className="node-resizer" data-location="bottom-left" />
        <div className="node-resizer" data-location="bottom-right" />
      </div> */
}
