import { useCallback, useEffect, useRef } from "react";

import Node from "./Node/Node.jsx";
import ShapeCanvas from "./Canvas/ShapeCanvas.jsx";
import LineGrid from "./Canvas/LineGrid.jsx";

import useMouse from "../stores/useMouse.js";
import usePanning from "../stores/usePanning";
import useNodes from "../stores/useNodes";
import useStartCoords from "../stores/useStartCoords.js";
import useWrapperRect from "../stores/useWrapperRect.js";

import useResizeObserver from "../hooks/useResizeObserver.jsx";

import { getWorldCoords } from "../utils/getWorldCoords.js";

import "./Whiteboard.css";

// debug: finding intersection: at the bottom of the code
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

function drawRoughLine(ctx, x1, y1, x2, y2, roughness) {
  const segments = 5; // Number of segments per line
  const dx = (x2 - x1) / segments;
  const dy = (y2 - y1) / segments;

  for (let i = 0; i <= segments; i++) {
    const x = x1 + dx * i + (Math.random() - 0.5) * roughness;
    const y = y1 + dy * i + (Math.random() - 0.5) * roughness;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
}

const Whiteboard = () => {
  // <------- states ------->
  const { mouseState, set_mouseState } = useMouse();

  const wrapperRect = useWrapperRect((state) => state.wrapperRect);

  const { scale, panOffsetCoords, set_scale, set_panOffsetCoords } =
    usePanning();

  const { startCoords, set_startCoords } = useStartCoords();

  const nodesMap = useNodes((state) => state.nodesMap);
  const add_node = useNodes((state) => state.add_node);

  // <------- refs ------->
  const newNodeConfigRef = useRef();
  const wrapperRef = useRef();
  const shapeCanvasRef = useRef();

  // <------- event handlers ------->
  const handleMouseDown = useCallback(
    (e) => {
      document.body.style.userSelect = "none";

      if (mouseState === "ADD_SQUARE") {
        // 1. select a shape from the side menu
        // 2. mousedown on whiteboard (here)
        // set startCoords
        const startCoords = getWorldCoords(
          e,
          panOffsetCoords,
          scale,
          wrapperRect
        );

        set_startCoords(startCoords);
      }
    },
    [mouseState, panOffsetCoords, scale, wrapperRect, set_startCoords]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (mouseState === "ADD_SQUARE") {
        if (!startCoords) return;

        // startCoords MUST exist
        const currentCoords = getWorldCoords(
          e,
          panOffsetCoords,
          scale,
          wrapperRect
        );

        // each movement
        // clear the canvas
        // draw the current shape
        // fix: draw any visible shape (culling)

        const shapeCanvas = shapeCanvasRef.current;
        const ctx = shapeCanvas.getContext("2d");

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.translate(panOffsetCoords.x, panOffsetCoords.y);
        ctx.scale(scale, scale);

        const x1 = Math.min(startCoords.x, currentCoords.x);
        const x2 = Math.max(startCoords.x, currentCoords.x);
        const y1 = Math.min(startCoords.y, currentCoords.y);
        const y2 = Math.max(startCoords.y, currentCoords.y);

        const position = { x: x1, y: y1 };
        const dimension = { width: x2 - x1, height: y2 - y1 };

        newNodeConfigRef.current = { position, dimension };

        // todo: draw
        // fix: calculate the svg path
        const roughness = 2;

        const topLeft = {
          x: position.x + (Math.random() - 0.5) * roughness,
          y: position.y + (Math.random() - 0.5) * roughness,
        };
        const topRight = {
          x: position.x + dimension.width + (Math.random() - 0.5) * roughness,
          y: position.y + (Math.random() - 0.5) * roughness,
        };
        const bottomRight = {
          x: position.x + dimension.width + (Math.random() - 0.5) * roughness,
          y: position.y + dimension.height + (Math.random() - 0.5) * roughness,
        };
        const bottomLeft = {
          x: position.x + (Math.random() - 0.5) * roughness,
          y: position.y + dimension.height + (Math.random() - 0.5) * roughness,
        };

        ctx.beginPath();
        ctx.moveTo(topLeft.x, topLeft.y);

        drawRoughLine(
          ctx,
          topLeft.x,
          topLeft.y,
          topRight.x,
          topRight.y,
          roughness
        );
        drawRoughLine(
          ctx,
          topRight.x,
          topRight.y,
          bottomRight.x,
          bottomRight.y,
          roughness
        );
        drawRoughLine(
          ctx,
          bottomRight.x,
          bottomRight.y,
          bottomLeft.x,
          bottomLeft.y,
          roughness
        );
        drawRoughLine(
          ctx,
          bottomLeft.x,
          bottomLeft.y,
          topLeft.x,
          topLeft.y,
          roughness
        );

        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
        // todo: draw

        return;
      }
    },
    [mouseState, startCoords, panOffsetCoords, scale, wrapperRect]
  );

  const handleMouseUp = useCallback(
    (e) => {
      document.body.style.userSelect = "auto";

      if (mouseState === "ADD_SQUARE") {
        // x,y, width, height???
        const { position, dimension } = newNodeConfigRef.current;

        const newNode = {
          id: `node-${Math.random()}`,
          // fix: type -> as of rn, just note
          type: "note",
          shape: "square",
          content: { html: "hi" },
          rotation: 0,
          position,
          dimension,
        };

        add_node(newNode);

        set_mouseState(null);
        set_startCoords(null);

        newNodeConfigRef.current = null;

        return;
      }
    },
    [mouseState, add_node, set_mouseState, set_startCoords]
  );

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

  // <------- custom hooks ------->
  useResizeObserver(wrapperRef);

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

      <LineGrid />
    </div>
  );
};

export default Whiteboard;
