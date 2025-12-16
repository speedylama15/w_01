import { useEffect } from "react";

import useSetCanvasDimension from "../../hooks/useSetCanvasDimension.jsx";

import useWrapperRect from "../../stores/useWrapperRect.js";
import usePanning from "../../stores/usePanning.js";

const DecorativeCanvas = ({ ref }) => {
  const wrapperRect = useWrapperRect((state) => state.wrapperRect);

  const scale = usePanning((state) => state.scale);
  const panOffsetCoords = usePanning((state) => state.panOffsetCoords);

  useSetCanvasDimension(ref);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");

    const dpr = window.devicePixelRatio || 1;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.scale(dpr, dpr);
    ctx.translate(panOffsetCoords.x, panOffsetCoords.y);
    ctx.scale(scale, scale);
  }, [ref, wrapperRect, panOffsetCoords, scale]);

  return (
    <>
      <canvas id="decorative-canvas-top" />;
      <canvas id="decorative-canvas-bottom" />;
    </>
  );
};

export default DecorativeCanvas;
