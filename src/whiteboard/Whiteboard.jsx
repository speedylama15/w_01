import { useRef } from "react";

import usePanning from "../stores/usePanning";

import "./Whiteboard.css";

const Whiteboard = () => {
  const wrapperRef = useRef();

  const scale = usePanning((state) => state.usePanning);
  const panOffsetCoords = usePanning((state) => state.panOffsetCoords);

  return (
    <div
      className="whiteboard-wrapper"
      ref={wrapperRef}
      // onMouseDown={handleMouseDown}
    >
      <div
        className="whiteboard"
        style={{
          transform: `translate(${panOffsetCoords.x}px, ${panOffsetCoords.y}px) scale(${scale})`,
          transformOrigin: "0 0",
        }}
      >
        {/* <GroupBox /> */}

        {/* <div className="whiteboard-nodes">
          {Object.keys(nodesMap).map((nodeID) => {
            return <Node key={nodeID} nodeID={nodeID} />;
          })}
        </div> */}

        {/* <div className="whiteboard-edges">
          {Object.keys(edgesMap).map((edgeID) => {
            return <Edge key={edgeID} edgeID={edgeID} />;
          })}
        </div> */}

        {/* {mouseState === "edge_create" && <NewEdge />} */}
      </div>

      {/* {wrapperRect && (
        <>
          <AlignmentLines />
          <NodesTree />
          <SearchBoxesTree />
        </>
      )} */}
    </div>
  );
};

export default Whiteboard;
