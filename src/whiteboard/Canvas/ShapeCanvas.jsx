import { useEffect, useRef } from "react";

import useNodes from "../../stores/useNodes.js";
import usePanning from "../../stores/usePanning.js";
import useWrapperRect from "../../stores/useWrapperRect.js";
import useTrees from "../../stores/useTrees.js";

import useSetCanvasDimension from "../../hooks/useSetCanvasDimension.jsx";

import { drawSquareWithBezierCurve } from "../../utils/drawSquareWithBezierCurve";
import { getWorldCoords } from "../../utils/getWorldCoords.js";

const getVisibleNodes = (nodesTree, panOffsetCoords, scale, wrapperRect) => {
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

  const visibleNodes = nodesTree.search(WRAPPERBOX);

  return visibleNodes;
};

const ShapeCanvas = ({ ref }) => {
  const nodesMap = useNodes((state) => state.nodesMap);
  // REVIEW: changes only when selection is made or un-made
  const nodesTree = useTrees((state) => state.nodesTree);

  const wrapperRect = useWrapperRect((state) => state.wrapperRect);

  const scale = usePanning((state) => state.scale);
  const panOffsetCoords = usePanning((state) => state.panOffsetCoords);

  useSetCanvasDimension(ref);

  // debug
  const drawCountRef = useRef(0);

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

    if (wrapperRect.x) {
      const nodes = getVisibleNodes(
        nodesTree,
        panOffsetCoords,
        scale,
        wrapperRect
      );
      // const nodes = Object.values(nodesMap);

      let count = 0;
      nodes.forEach((item) => {
        const node = item.node || item;
        drawSquareWithBezierCurve(ctx, node, 10);

        // debug
        count += 1;
      });

      drawCountRef.current = count;
    }
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

      <button
        style={{ position: "absolute", top: 0, left: 0, zIndex: 1000000 }}
      >
        {drawCountRef.current}
      </button>
    </>
  );
};

export default ShapeCanvas;
