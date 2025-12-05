import { useEffect } from "react";

import usePanning from "../../stores/usePanning.js";
import useWrapperRect from "../../stores/useWrapperRect.js";

import useSetCanvasDimension from "../../hooks/useSetCanvasDimension.jsx";

const NewNodeCanvas = ({ ref }) => {
  const wrapperRect = useWrapperRect((state) => state.wrapperRect);

  const scale = usePanning((state) => state.scale);
  const panOffsetCoords = usePanning((state) => state.panOffsetCoords);

  useSetCanvasDimension(ref);

  useEffect(() => {
    const canvas = ref.current;

    // debug: do I not need this?
    // if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const dpr = window.devicePixelRatio || 1;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.scale(dpr, dpr);
    ctx.translate(panOffsetCoords.x, panOffsetCoords.y);
    ctx.scale(scale, scale);
  }, [ref, wrapperRect, panOffsetCoords, scale]);

  return (
    <canvas
      id="new-node-canvas"
      ref={ref}
      width={wrapperRect.width}
      height={wrapperRect.height}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 100,
        pointerEvents: "none",
      }}
    />
  );
};

export default NewNodeCanvas;
