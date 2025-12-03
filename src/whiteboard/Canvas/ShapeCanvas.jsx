import { useEffect } from "react";

import useNodes from "../../stores/useNodes.js";
import usePanning from "../../stores/usePanning.js";
import useWrapperRect from "../../stores/useWrapperRect.js";

const ShapeCanvas = ({ ref }) => {
  const nodesMap = useNodes((state) => state.nodesMap);

  const wrapperRect = useWrapperRect((state) => state.wrapperRect);

  const scale = usePanning((state) => state.scale);
  const panOffsetCoords = usePanning((state) => state.panOffsetCoords);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");

    // 1. Reset transform FIRST
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // 2. Clear in screen space (before any transforms)
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // 3. Apply viewport transformation
    ctx.translate(panOffsetCoords.x, panOffsetCoords.y);
    ctx.scale(scale, scale);

    Object.values(nodesMap).forEach(() => {
      // 4. Draw in world coordinates
    });
  }, [ref, panOffsetCoords, scale, nodesMap]);

  return (
    <canvas
      id="shape-canvas"
      ref={ref}
      width={wrapperRect.width}
      height={wrapperRect.height}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
      }}
    />
  );
};

export default ShapeCanvas;
