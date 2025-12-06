import { memo, useCallback, useRef } from "react";

import NodeRotator from "./NodeRotator/NodeRotator.jsx";

import useNodes from "../../stores/useNodes";
import useMouse from "../../stores/useMouse";
import useSelection from "../../stores/useSelection";

import "./Node.css";

const Node = memo(({ nodeID }) => {
  const node = useNodes((state) => state.nodesMap[nodeID]);
  const isSingleSelected = useSelection(
    (state) => state.singleSelectedNode?.id === nodeID
  );
  // isMultiSelected?

  const set_mouseState = useMouse((state) => state.set_mouseState);
  const set_singleSelectedNode = useSelection(
    (state) => state.set_singleSelectedNode
  );

  const nodeRef = useRef(null);

  const handleMouseDown = useCallback(() => {
    // idea: maybe I should allow propagation so that necessary functionalities are triggered
    // set mouse state
    set_mouseState("SINGLE_NODE_MOVE");
    // set single selected node
    set_singleSelectedNode(node);

    return;
  }, [node, set_mouseState, set_singleSelectedNode]);

  return (
    <div
      ref={nodeRef}
      data-node-id={node.id}
      className="node"
      style={{
        position: "absolute",
        backgroundColor: "#54aaffff",
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
        <p>{node.content.html}</p>
      </div>

      {isSingleSelected && (
        <div
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
          <NodeRotator node={node} />

          {/* <NodeResizer node={node} type="single" location={"top"} />
        <NodeResizer node={node} type="single" location={"right"} />
        <NodeResizer node={node} type="single" location={"bottom"} />
        <NodeResizer node={node} type="single" location={"left"} />

        <NodeResizer node={node} type="multi" location={"top-left"} />
        <NodeResizer node={node} type="multi" location={"top-right"} />
        <NodeResizer node={node} type="multi" location={"bottom-left"} />
        <NodeResizer node={node} type="multi" location={"bottom-right"} />

        <NodeHandle node={node} handleLocation={"top"} />
        <NodeHandle node={node} handleLocation={"right"} />
        <NodeHandle node={node} handleLocation={"bottom"} />
        <NodeHandle node={node} handleLocation={"left"} /> */}
        </div>
      )}
    </div>
  );
});

export default Node;
