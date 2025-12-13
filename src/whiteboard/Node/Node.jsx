import { memo, useCallback, useRef } from "react";

import Editor from "../../editor/Editor.jsx";

import useNodes from "../../stores/useNodes";
import useMouse from "../../stores/useMouse";
import useSelection from "../../stores/useSelection";
import useTrees from "../../stores/useTrees.js";

import "./Node.css";

const Node = memo(({ nodeID }) => {
  const node = useNodes((state) => state.nodesMap[nodeID]);
  // isMultiSelected?

  const set_mouseState = useMouse((state) => state.set_mouseState);
  const set_singleSelectedNode = useSelection(
    (state) => state.set_singleSelectedNode
  );

  const set_nodesTree = useTrees((state) => state.set_nodesTree);

  const nodeRef = useRef(null);

  const handleMouseDown = useCallback(
    (e) => {
      // debug
      e.stopPropagation();

      document.body.style.userSelect = "none";

      // set mouse state
      set_mouseState("SINGLE_NODE_MOVE");
      // set single selected node
      set_singleSelectedNode(node);
      // todo: maybe here?
      set_nodesTree(node);

      return;
    },
    [node, set_mouseState, set_singleSelectedNode, set_nodesTree]
  );

  // debug: check on this seldomly
  // console.log("RENDER", node.id);

  return (
    <div
      ref={nodeRef}
      data-node-id={node.id}
      className="node"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 5,
        width: node.dimension.width,
        height: node.dimension.height,
        transform: `translate3d(${node.position.x}px, ${node.position.y}px, 0)`,
        transformOrigin: "0 0",

        // debug
        // backgroundColor: "#ffc80163",
        // padding: "12px",
        // padding: 0,
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

          // debug
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#58ffcaff",
          // borderRadius: "7px",
          borderRadius: "50%",
          // padding: "12px",
          border: "1px solid #000",
        }}
      >
        <Editor />
      </div>
    </div>
  );
});

export default Node;
