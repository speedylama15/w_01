import { useEffect } from "react";

import useNodes from "../../stores/useNodes.js";
import usePanning from "../../stores/usePanning.js";
import useWrapperRect from "../../stores/useWrapperRect.js";

import useSetCanvasDimension from "../../hooks/useSetCanvasDimension.jsx";

import { drawSquareWithBezierCurve } from "../utils/drawSquareWithBezierCurve.js";

const ShapeCanvas = ({ ref }) => {
  const nodesMap = useNodes((state) => state.nodesMap);

  const wrapperRect = useWrapperRect((state) => state.wrapperRect);

  const scale = usePanning((state) => state.scale);
  const panOffsetCoords = usePanning((state) => state.panOffsetCoords);

  useSetCanvasDimension(ref);

  // review: for enhancement
  // idea: perhaps I can even make dpr a state for optimization
  // idea: lower the dpr when zooming or panning
  // idea: increase dpr when scale increases
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");

    const dpr = window.devicePixelRatio || 1;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.scale(dpr, dpr);
    ctx.translate(panOffsetCoords.x, panOffsetCoords.y);
    ctx.scale(scale, scale);

    const nodes = Object.values(nodesMap);

    nodes.forEach((node) => {
      drawSquareWithBezierCurve(ctx, node, 10);
    });
  }, [ref, wrapperRect, panOffsetCoords, scale, nodesMap]);

  return (
    <>
      <canvas
        id="shape-canvas"
        ref={ref}
        width={wrapperRect.width}
        height={wrapperRect.height}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 2,
          pointerEvents: "none",
        }}
      />
    </>
  );
};

export default ShapeCanvas;
