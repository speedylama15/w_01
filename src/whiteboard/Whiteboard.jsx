import { useCallback, useEffect, useRef } from "react";
import paper from "paper";

import Node from "./Node/Node.jsx";

import usePanning from "../stores/usePanning";
import useNodes from "../stores/useNodes";

import "./Whiteboard.css";

const Whiteboard = () => {
  const wrapperRef = useRef();

  // debug
  const nodeRef = useRef();
  const handleClick = useCallback((node, nodeDOM) => {
    nodeRef.current = { node, nodeDOM };
  }, []);
  // debug

  const { scale, set_scale, panOffsetCoords, set_panOffsetCoords } =
    usePanning();

  const nodesMap = useNodes((state) => state.nodesMap);

  // <------- event handlers ------->
  const handleMouseDown = () => {};

  // todo: finding intersection

  const handleMouseMove = useCallback(
    (e) => {
      const wrapperRect = wrapperRef.current.getBoundingClientRect();

      if (nodeRef.current) {
        // idea: optimize wrapperRect and nodeRect
        const {
          // fix: did not have to use node...
          node,
          nodeDOM,
        } = nodeRef.current;

        const nodeRect = nodeDOM.getBoundingClientRect();

        const whiteboardX =
          (e.clientX - wrapperRect.left - panOffsetCoords.x) / scale;
        const nodeX =
          (nodeRect.left - wrapperRect.left - panOffsetCoords.x) / scale;
        const localX = whiteboardX - nodeX;

        const whiteboardY =
          (e.clientY - wrapperRect.top - panOffsetCoords.y) / scale;
        const nodeY =
          (nodeRect.top - wrapperRect.top - panOffsetCoords.y) / scale;
        const localY = whiteboardY - nodeY;

        const svg = nodeDOM.querySelector("svg");
        const path = nodeDOM.querySelector("path");
        const pathData = path.getAttribute("d");

        const scope = new paper.PaperScope();
        const canvas = document.createElement("canvas");
        scope.setup(canvas);

        const BOUNDARY = 10;

        const shape = new scope.Path(pathData);

        const hLine = new scope.Path.Line(
          new scope.Point(localX - BOUNDARY, localY),
          new scope.Point(localX + BOUNDARY, localY)
        );

        const vLine = new scope.Path.Line(
          new scope.Point(localX, localY - BOUNDARY),
          new scope.Point(localX, localY + BOUNDARY)
        );

        const intersections = [
          ...shape.getIntersections(hLine),
          ...shape.getIntersections(vLine),
        ];

        const oldCircles = svg.querySelectorAll("circle");
        oldCircles.forEach((circle) => circle.remove());

        intersections.forEach((i) => {
          // idea: exact coordinates
          // review: gotta check if it's local or not
          // console.log(i.point.x, i.point.y);

          const circle = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle"
          );
          circle.setAttribute("cx", i.point.x);
          circle.setAttribute("cy", i.point.y);
          circle.setAttribute("r", 4);
          circle.setAttribute("fill", "red");
          svg.appendChild(circle);
        });
      }
    },
    [panOffsetCoords, scale]
  );
  // todo: finding intersection

  const handleMouseUp = useCallback((e) => {
    document.body.style.userSelect = "auto";
  }, []);

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
        }}
      >
        <div className="whiteboard-nodes">
          {Object.keys(nodesMap).map((nodeID) => {
            return (
              <Node
                key={nodeID}
                nodeID={nodeID}
                // debug
                handleClick={handleClick}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Whiteboard;
