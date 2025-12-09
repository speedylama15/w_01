import { useCallback, useEffect, useMemo, useRef } from "react";
import throttle from "lodash.throttle";

import Node from "./Node/Node.jsx";
import NodeControls from "./NodeControls/NodeControls.jsx";
import LineGrid from "./Canvas/LineGrid.jsx";
import NodesTree from "./Canvas/NodesTree.jsx";
import NewNodeCanvas from "./Canvas/NewNodeCanvas.jsx";
import ShapeCanvas from "./Canvas/ShapeCanvas.jsx";
import SearchBoxCanvas from "./Canvas/SearchBoxCanvas.jsx";

import useMouse from "../stores/useMouse.js";
import usePanning from "../stores/usePanning";
import useNodes from "../stores/useNodes";
import useWrapperRect from "../stores/useWrapperRect.js";
import useSelection from "../stores/useSelection.js";
import useResize from "../stores/useResize.js";

import useObserveWrapperRect from "../hooks/useObserveWrapperRect.jsx";

import { getWorldCoords } from "../utils/getWorldCoords.js";
import { getNodeAABB } from "../utils/getNodeAABB.js";
import { getRadian } from "../utils/getRadian.js";
import { drawSquareWithBezierCurve } from "../utils/drawSquareWithBezierCurve.js";

import "./Whiteboard.css";
import useTrees from "../stores/useTrees.js";

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

const getWrapperBox = (panOffsetCoords, scale, wrapperRect) => {
  const minXY = { x: wrapperRect.x, y: wrapperRect.y };
  const maxXY = {
    x: wrapperRect.x + wrapperRect.width,
    y: wrapperRect.y + wrapperRect.height,
  };

  const worldMinXY = getWorldCoords(minXY, panOffsetCoords, scale, wrapperRect);
  const worldMaxXY = getWorldCoords(maxXY, panOffsetCoords, scale, wrapperRect);

  const WRAPPERBOX = {
    minX: worldMinXY.x,
    minY: worldMinXY.y,
    maxX: worldMaxXY.x,
    maxY: worldMaxXY.y,
  };

  return WRAPPERBOX;
};

const Whiteboard = () => {
  // <------- states ------->
  const { mouseState, set_mouseState } = useMouse();

  const wrapperRect = useWrapperRect((state) => state.wrapperRect);

  // todo
  const nodesTree = useTrees((state) => state.nodesTree);
  const visibleNodes = useNodes((state) => state.visibleNodes);
  const set_visibleNodes = useNodes((state) => state.set_visibleNodes);
  // todo

  const { scale, panOffsetCoords, set_scale, set_panOffsetCoords } =
    usePanning();

  const nodesMap = useNodes((state) => state.nodesMap);
  const add_node = useNodes((state) => state.add_node);
  const set_node = useNodes((state) => state.set_node);
  const newNode = useNodes((state) => state.newNode);
  const set_newNode = useNodes((state) => state.set_newNode);

  const singleSelectedNode = useSelection((state) => state.singleSelectedNode);
  const set_singleSelectedNode = useSelection(
    (state) => state.set_singleSelectedNode
  );

  const resizeData = useResize((state) => state.resizeData);

  // <------- refs ------->

  const wrapperRef = useRef();
  const shapeCanvasRef = useRef();
  const newNodeCanvasRef = useRef();
  const searchBoxCanvasRef = useRef();

  // setting start coords inside of Node or local components is BAD
  // IMPORTANT: because getting coords requires panOffsetCoords and scale which constantly change
  // which triggers a re-rendering of local component/s which is BIG NO NO
  const startCoordsRef = useRef();

  // <------- custom hooks ------->
  useObserveWrapperRect(wrapperRef);
  // useNodesTree();

  // <------- event handlers ------->
  const handleMouseDown = useCallback(
    (e) => {
      document.body.style.userSelect = "none";

      if (mouseState === "ADD_SQUARE") {
        // ADD SQUARE button MUST be clicked FIRST and then this logic can begin
        // mousedown on whiteboard wrapper MUST happen
        // set the start coords
        // if start coords does not exist, nothing will happen
        startCoordsRef.current = getWorldCoords(
          { x: e.clientX, y: e.clientY },
          panOffsetCoords,
          scale,
          wrapperRect
        );

        return;
      }

      // local level mousedown and document level mousedown
      // when it bubbles up to document, document does not receive the updated mouseState
      // that's why inside of Node's mousedown, I have e.stopPropagation and just gave it document.body thing
      if (mouseState === null) {
        set_singleSelectedNode(null);
      }
    },
    [mouseState, panOffsetCoords, scale, wrapperRect, set_singleSelectedNode]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (mouseState === "ADD_SQUARE" && startCoordsRef.current) {
        // startCoords MUST exist
        const currentCoords = getWorldCoords(
          { x: e.clientX, y: e.clientY },
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
            { x: e.clientX, y: e.clientY },
            panOffsetCoords,
            scale,
            wrapperRect
          );
        }

        const SEARCH_BOUNDARY = 500;

        const currentCoords = getWorldCoords(
          { x: e.clientX, y: e.clientY },
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

      if (mouseState === "SINGLE_NODE_ROTATE") {
        const { id } = singleSelectedNode;

        const radian = getRadian(e, id);

        // debug: maybe enable snapping to 0, 90, 180, 270?

        set_node({ ...singleSelectedNode, rotation: radian });
      }

      if (mouseState === "SINGLE_NODE_RESIZE") {
        if (!resizeData) return;

        const initNode = singleSelectedNode;
        const { startCoords, location } = resizeData;

        let newX = initNode.position.x;
        let newY = initNode.position.y;
        let newWidth = initNode.dimension.width;
        let newHeight = initNode.dimension.height;

        const currentCoords = getWorldCoords(
          { x: e.clientX, y: e.clientY },
          panOffsetCoords,
          scale,
          wrapperRect
        );

        if (location === "top") {
          const deltaY = currentCoords.y - startCoords.y;
          newY = currentCoords.y;
          newHeight = Math.abs(initNode.dimension.height - deltaY);

          if (
            currentCoords.y >=
            initNode.position.y + initNode.dimension.height
          ) {
            newY = initNode.position.y + initNode.dimension.height;
          }
        }

        if (location === "bottom") {
          const deltaY = -(currentCoords.y - startCoords.y);
          newHeight = Math.abs(initNode.dimension.height - deltaY);

          if (currentCoords.y <= initNode.position.y) {
            newY = currentCoords.y;
          }
        }

        if (location === "right") {
          const deltaX = currentCoords.x - startCoords.x;
          newWidth = Math.abs(initNode.dimension.width + deltaX);

          if (currentCoords.x <= initNode.position.x) {
            newX = currentCoords.x;
          }
        }

        if (location === "left") {
          const deltaX = -(currentCoords.x - startCoords.x);
          newX = currentCoords.x;
          newWidth = Math.abs(initNode.dimension.width + deltaX);

          if (
            currentCoords.x >=
            initNode.position.x + initNode.dimension.width
          ) {
            newX = initNode.position.x + initNode.dimension.width;
          }
        }

        if (location === "top-right") {
          const deltaX = currentCoords.x - startCoords.x;
          const deltaY = currentCoords.y - startCoords.y;
          newY = currentCoords.y;
          newWidth = Math.abs(initNode.dimension.width + deltaX);
          newHeight = Math.abs(initNode.dimension.height - deltaY);

          if (currentCoords.x <= initNode.position.x) {
            newX = currentCoords.x;
          }

          if (
            currentCoords.y >=
            initNode.position.y + initNode.dimension.height
          ) {
            newY = initNode.position.y + initNode.dimension.height;
          }
        }

        if (location === "top-left") {
          newX = currentCoords.x;
          newY = currentCoords.y;

          const deltaX = -(currentCoords.x - startCoords.x);
          const deltaY = currentCoords.y - startCoords.y;

          newWidth = Math.abs(initNode.dimension.width + deltaX);
          newHeight = Math.abs(initNode.dimension.height - deltaY);

          if (
            currentCoords.x >=
            initNode.position.x + initNode.dimension.width
          ) {
            newX = initNode.position.x + initNode.dimension.width;
          }

          if (
            currentCoords.y >=
            initNode.position.y + initNode.dimension.height
          ) {
            newY = initNode.position.y + initNode.dimension.height;
          }
        }

        if (location === "bottom-right") {
          const deltaX = currentCoords.x - startCoords.x;
          const deltaY = -(currentCoords.y - startCoords.y);

          newWidth = Math.abs(initNode.dimension.width + deltaX);
          newHeight = Math.abs(initNode.dimension.height - deltaY);

          if (currentCoords.x <= initNode.position.x) {
            newX = currentCoords.x;
          }

          if (currentCoords.y <= initNode.position.y) {
            newY = currentCoords.y;
          }
        }

        if (location === "bottom-left") {
          newX = currentCoords.x;

          const deltaX = -(currentCoords.x - startCoords.x);
          const deltaY = -(currentCoords.y - startCoords.y);

          newWidth = Math.abs(initNode.dimension.width + deltaX);
          newHeight = Math.abs(initNode.dimension.height - deltaY);

          if (
            currentCoords.x >=
            initNode.position.x + initNode.dimension.width
          ) {
            newX = initNode.position.x + initNode.dimension.width;
          }

          if (currentCoords.y <= initNode.position.y) {
            newY = currentCoords.y;
          }
        }

        set_node({
          ...initNode,
          position: { x: newX, y: newY },
          dimension: {
            width: newWidth,
            height: newHeight,
          },
        });
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
      resizeData,
    ]
  );

  const handleMouseUp = useCallback(() => {
    document.body.style.userSelect = "auto";

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

    if (mouseState === "SINGLE_NODE_RESIZE") {
      set_mouseState(null);
    }
  }, [mouseState, add_node, set_mouseState, newNode, set_newNode]);

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

  // todo
  const visibleNodesRef = useRef(null);
  const callbackID = useRef();
  const indexRef = useRef(0);

  const getVisibleNodes = useCallback(() => {
    const WRAPPERBOX = getWrapperBox(panOffsetCoords, scale, wrapperRect);

    let r = [];

    const result = nodesTree.search(WRAPPERBOX);

    const singleSelectedNode = useSelection.getState().singleSelectedNode;

    // fix:
    console.log("singleSelectedNode", singleSelectedNode);

    // multiSelectedNodes
    if (singleSelectedNode) {
      r = [...result, singleSelectedNode];
      return r;
    } else {
      return result;
    }
  }, [panOffsetCoords, scale, wrapperRect, nodesTree]);

  const throttle_getVisibleNodes = useMemo(
    () => throttle(getVisibleNodes, 100),
    [getVisibleNodes]
  );

  useEffect(() => {
    // useEffect invoked? -> fetch new set of visibleNodes -> cancel all callbacks
    cancelIdleCallback(callbackID.current);

    // reset the index
    indexRef.current = 0;

    visibleNodesRef.current = null;
    set_visibleNodes([]);
    // throttle
    visibleNodesRef.current = throttle_getVisibleNodes();

    const callback_progressiveRendering = (deadline) => {
      while (
        deadline.timeRemaining() &&
        indexRef.current < visibleNodesRef.current.length - 1
      ) {
        const node = visibleNodesRef.current[indexRef.current];

        set_visibleNodes([...useNodes.getState().visibleNodes, node]);

        indexRef.current++;
      }

      if (indexRef.current >= visibleNodesRef.current.length - 1) {
        cancelIdleCallback(callbackID.current);
      }

      if (indexRef.current < visibleNodesRef.current.length - 1) {
        callbackID.current = requestIdleCallback(callback_progressiveRendering);
      }
    };

    // there has to be nodes to render first
    if (visibleNodesRef.current && visibleNodesRef.current.length > 100) {
      // store the id
      callbackID.current = requestIdleCallback(callback_progressiveRendering);
    } else if (visibleNodesRef.current) {
      set_visibleNodes(visibleNodesRef.current);
    }

    return () => {
      cancelIdleCallback(callbackID.current);
    };
  }, [
    panOffsetCoords,
    scale,
    wrapperRect,
    nodesTree,
    set_visibleNodes,
    singleSelectedNode,
    throttle_getVisibleNodes,
  ]);
  // todo

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
          {visibleNodes.map((item) => {
            const node = item.node || item;

            return <Node key={node.id} nodeID={node.id} />;
          })}
        </div>

        <NodeControls />
      </div>

      {/* <ShapeCanvas ref={shapeCanvasRef} /> */}
      <NewNodeCanvas ref={newNodeCanvasRef} />
      <SearchBoxCanvas ref={searchBoxCanvasRef} />

      <LineGrid />
      {/* <NodesTree /> */}
    </div>
  );
};

export default Whiteboard;
