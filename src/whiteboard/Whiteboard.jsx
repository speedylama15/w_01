import { useCallback, useEffect, useRef } from "react";

import Node from "./Node/Node.jsx";
import LineGrid from "./Canvas/LineGrid.jsx";
import NodesTree from "./Canvas/NodesTree.jsx";
import NewNodeCanvas from "./Canvas/NewNodeCanvas.jsx";
import ShapeCanvas from "./Canvas/ShapeCanvas.jsx";
import SearchBoxCanvas from "./Canvas/SearchBoxCanvas.jsx";

import useMouse from "../stores/useMouse.js";
import usePanning from "../stores/usePanning";
import useNodes from "../stores/useNodes";
import useWrapperRect from "../stores/useWrapperRect.js";
import useTrees from "../stores/useTrees.js";
import useSelection from "../stores/useSelection.js";

import useObserveWrapperRect from "../hooks/useObserveWrapperRect.jsx";

import { getWorldCoords } from "../utils/getWorldCoords.js";
import { getNodeAABB } from "../utils/getNodeAABB.js";
import { getRadian } from "../utils/getRadian.js";
import { drawSquareWithBezierCurve } from "../utils/drawSquareWithBezierCurve.js";

import "./Whiteboard.css";

// debug: finding intersection
// const handleMouseMove = useCallback(
//   (e) => {
//     const wrapperRect = wrapperRef.current.getBoundingClientRect();

//     if (nodeRef.current) {
//       // idea: optimize wrapperRect and nodeRect
//       const {
//         // fix: did not have to use node...
//         node,
//         nodeDOM,
//       } = nodeRef.current;

//       const nodeRect = nodeDOM.getBoundingClientRect();

//       const whiteboardX =
//         (e.clientX - wrapperRect.left - panOffsetCoords.x) / scale;
//       // review: I'm pretty sure I can just use the world coord of nodeX instead of all this calculation
//       const nodeX =
//         (nodeRect.left - wrapperRect.left - panOffsetCoords.x) / scale;
//       const localX = whiteboardX - nodeX;

//       const whiteboardY =
//         (e.clientY - wrapperRect.top - panOffsetCoords.y) / scale;
//       const nodeY =
//         (nodeRect.top - wrapperRect.top - panOffsetCoords.y) / scale;
//       const localY = whiteboardY - nodeY;

//       const svg = nodeDOM.querySelector("svg");
//       const path = nodeDOM.querySelector("path");
//       const pathData = path.getAttribute("d");

//       const scope = new paper.PaperScope();
//       const canvas = document.createElement("canvas");
//       scope.setup(canvas);

//       const BOUNDARY = 10;

//       const shape = new scope.Path(pathData);

//       const hLine = new scope.Path.Line(
//         new scope.Point(localX - BOUNDARY, localY),
//         new scope.Point(localX + BOUNDARY, localY)
//       );

//       const vLine = new scope.Path.Line(
//         new scope.Point(localX, localY - BOUNDARY),
//         new scope.Point(localX, localY + BOUNDARY)
//       );

//       const intersections = [
//         ...shape.getIntersections(hLine),
//         ...shape.getIntersections(vLine),
//       ];

//       const oldCircles = svg.querySelectorAll("circle");
//       oldCircles.forEach((circle) => circle.remove());

//       intersections.forEach((i) => {
//         // idea: exact coordinates
//         // review: gotta check if it's local or not
//         // console.log(i.point.x, i.point.y);

//         const circle = document.createElementNS(
//           "http://www.w3.org/2000/svg",
//           "circle"
//         );
//         circle.setAttribute("cx", i.point.x);
//         circle.setAttribute("cy", i.point.y);
//         circle.setAttribute("r", 4);
//         circle.setAttribute("fill", "red");
//         svg.appendChild(circle);
//       });
//     }
//   },
//   [panOffsetCoords, scale]
// );

const Whiteboard = () => {
  // <------- states ------->
  const { mouseState, set_mouseState } = useMouse();

  const wrapperRect = useWrapperRect((state) => state.wrapperRect);

  const { scale, panOffsetCoords, set_scale, set_panOffsetCoords } =
    usePanning();

  const set_nodesTree = useTrees((state) => state.set_nodesTree);
  const reset_nodesTree = useTrees((state) => state.reset_nodesTree);

  const nodesMap = useNodes((state) => state.nodesMap);
  const add_node = useNodes((state) => state.add_node);
  const set_node = useNodes((state) => state.set_node);
  const newNode = useNodes((state) => state.newNode);
  const set_newNode = useNodes((state) => state.set_newNode);

  const singleSelectedNode = useSelection((state) => state.singleSelectedNode);

  // <------- refs ------->

  const wrapperRef = useRef();
  const shapeCanvasRef = useRef();
  const newNodeCanvasRef = useRef();
  const searchBoxCanvasRef = useRef();

  // setting start coords inside of Node or local components is BAD
  // because getting coords requires panOffsetCoords and scale which constantly change
  // which triggers a re-rendering of local component/s which is BIG NO NO
  const startCoordsRef = useRef();

  // <------- custom hooks ------->
  useObserveWrapperRect(wrapperRef);

  // <------- event handlers ------->
  const handleMouseDown = useCallback(
    (e) => {
      // idea: perhaps this is the place in which I need to set up rTree
      // idea: maybe create a util function to set up rTree
      set_nodesTree([]);

      document.body.style.userSelect = "none";

      if (mouseState === "ADD_SQUARE") {
        // ADD SQUARE button MUST be clicked FIRST and then this logic can begin
        // mousedown on whiteboard wrapper MUST happen
        // set the start coords
        // if start coords does not exist, nothing will happen
        startCoordsRef.current = getWorldCoords(
          e,
          panOffsetCoords,
          scale,
          wrapperRect
        );
      }
    },
    [mouseState, panOffsetCoords, scale, wrapperRect, set_nodesTree]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (mouseState === "ADD_SQUARE" && startCoordsRef.current) {
        // startCoords MUST exist
        const currentCoords = getWorldCoords(
          e,
          panOffsetCoords,
          scale,
          wrapperRect
        );

        const newNodeCanvas = newNodeCanvasRef.current;
        const ctx = newNodeCanvas.getContext("2d");
        const dpr = window.devicePixelRatio || 1;

        // reset and clear
        // todo: selective drawing -> culling
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // provide scale + transform + sharp scale
        ctx.scale(dpr, dpr);
        ctx.translate(panOffsetCoords.x, panOffsetCoords.y);
        ctx.scale(scale, scale);

        const x1 = Math.min(startCoordsRef.current.x, currentCoords.x);
        const x2 = Math.max(startCoordsRef.current.x, currentCoords.x);
        const y1 = Math.min(startCoordsRef.current.y, currentCoords.y);
        const y2 = Math.max(startCoordsRef.current.y, currentCoords.y);

        // todo: perhaps I need to set a minimum width and height???
        const position = { x: x1, y: y1 };
        const dimension = { width: x2 - x1, height: y2 - y1 };

        // store the new pos and dim of new node
        set_newNode({ position, dimension });

        // draw
        // DEBUG: DRAW NODE
        drawSquareWithBezierCurve(ctx, { position, dimension });

        return;
      }

      if (mouseState === "SINGLE_NODE_MOVE") {
        if (!startCoordsRef.current) {
          startCoordsRef.current = getWorldCoords(
            e,
            panOffsetCoords,
            scale,
            wrapperRect
          );
        }

        const SEARCH_BOUNDARY = 500;

        const currentCoords = getWorldCoords(
          e,
          panOffsetCoords,
          scale,
          wrapperRect
        );

        // make it move by 1px
        const diffX = Math.floor(currentCoords.x - startCoordsRef.current.x);
        const diffY = Math.floor(currentCoords.y - startCoordsRef.current.y);

        // these are CONSTANTLY updated
        // draw on search box canvas
        const NODEBOX = getNodeAABB(singleSelectedNode);
        const SEARCHBOX = {
          minX: NODEBOX.minX + diffX - SEARCH_BOUNDARY,
          minY: NODEBOX.minY + diffY - SEARCH_BOUNDARY,
          maxX: NODEBOX.maxX + diffX + SEARCH_BOUNDARY,
          maxY: NODEBOX.maxY + diffY + SEARCH_BOUNDARY,
          node: singleSelectedNode,
        };

        const searchBoxCanvas = searchBoxCanvasRef.current;
        const ctx = searchBoxCanvas.getContext("2d");
        const dpr = window.devicePixelRatio || 1;

        ctx.lineWidth = 5;
        ctx.strokeStyle = "#009b03ff";

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.scale(dpr, dpr);
        ctx.translate(panOffsetCoords.x, panOffsetCoords.y);
        ctx.scale(scale, scale);

        ctx.strokeRect(
          SEARCHBOX.minX,
          SEARCHBOX.minY,
          SEARCHBOX.maxX - SEARCHBOX.minX,
          SEARCHBOX.maxY - SEARCHBOX.minY
        );

        // the selected node holds the init data in which we can base it off of
        const initNode = singleSelectedNode;
        // updated node
        const updatedNode = {
          ...initNode,
          position: {
            x: initNode.position.x + diffX,
            y: initNode.position.y + diffY,
          },
        };

        set_node(updatedNode);
      }

      // todo
      if (mouseState === "SINGLE_NODE_ROTATE") {
        const { id } = singleSelectedNode;

        const radian = getRadian(e, id);

        // debug: maybe enable snapping to 0, 90, 180, 270?

        set_node({ ...singleSelectedNode, rotation: radian });
      }
    },
    [
      mouseState,
      panOffsetCoords,
      scale,
      wrapperRect,
      set_newNode,
      singleSelectedNode,
      set_node,
    ]
  );

  const handleMouseUp = useCallback(() => {
    document.body.style.userSelect = "auto";

    // for visualization
    reset_nodesTree();

    // a node to add MUST exist
    if (mouseState === "ADD_SQUARE" && newNode && startCoordsRef.current) {
      const { position, dimension } = newNode;

      // debug: NODE STRUCTURE
      const node = {
        id: `node-${Math.random()}`,
        type: "note",
        shape: "square",
        content: { html: "hi" },
        rotation: 0,
        position,
        dimension,
      };

      add_node(node);

      // idea: maybe get this out in the open because this is something that always (?) has to trigger?
      startCoordsRef.current = null;
      set_mouseState(null);
      set_newNode(null);

      // clear new node canvas
      const newNodeCanvas = newNodeCanvasRef.current;
      const ctx = newNodeCanvas.getContext("2d");
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      return;
    }

    if (mouseState === "SINGLE_NODE_MOVE") {
      // I need to obtain the updated node's values
      // because it's important to know if the node moved out of the group and I need to check its box
      // DEBUG: this is for later when working with grouping

      startCoordsRef.current = null;
      set_mouseState(null);

      // clear search box canvas
      const searchBoxCanvas = searchBoxCanvasRef.current;
      const ctx = searchBoxCanvas.getContext("2d");
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      return;
    }

    if (mouseState === "SINGLE_NODE_ROTATE") {
      set_mouseState(null);
    }
  }, [
    mouseState,
    add_node,
    set_mouseState,
    reset_nodesTree,
    newNode,
    set_newNode,
  ]);

  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();

      const wrapper = wrapperRef.current;
      const rect = wrapper.getBoundingClientRect();

      if (e.ctrlKey) {
        const zoomAmount = 1 - e.deltaY * 0.01;
        const newScale = Math.max(0.1, Math.min(5, scale * zoomAmount));

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const startPosX = (mouseX - panOffsetCoords.x) / scale;
        const startPosY = (mouseY - panOffsetCoords.y) / scale;
        const newPanX = mouseX - startPosX * newScale;
        const newPanY = mouseY - startPosY * newScale;

        set_scale(newScale);
        set_panOffsetCoords({ x: newPanX, y: newPanY });
      } else {
        set_panOffsetCoords((prev) => ({
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY,
        }));
      }
    },
    [panOffsetCoords, scale, set_panOffsetCoords, set_scale]
  );

  // <------- useEffects ------->
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    wrapper.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      wrapper.removeEventListener("wheel", handleWheel);
    };
  }, [handleMouseMove, handleMouseUp, handleWheel]);

  // <------- DOM ------->
  return (
    <div
      className="whiteboard-wrapper"
      ref={wrapperRef}
      onMouseDown={handleMouseDown}
    >
      <div
        className="whiteboard"
        style={{
          transform: `translate(${panOffsetCoords.x}px, ${panOffsetCoords.y}px) scale(${scale})`,
          // review: I forgot but this has some significance
          transformOrigin: "0 0",
        }}
      >
        <div className="whiteboard-nodes">
          {Object.keys(nodesMap).map((nodeID) => {
            return <Node key={nodeID} nodeID={nodeID} />;
          })}
        </div>
      </div>

      <ShapeCanvas ref={shapeCanvasRef} />
      <NewNodeCanvas ref={newNodeCanvasRef} />
      <SearchBoxCanvas ref={searchBoxCanvasRef} />

      <LineGrid />

      <NodesTree />
    </div>
  );
};

export default Whiteboard;
