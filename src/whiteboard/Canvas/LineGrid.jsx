import { useEffect, useRef } from "react";

import usePanning from "../../stores/usePanning.js";
import useWrapperRect from "../../stores/useWrapperRect.js";

const LineGrid = () => {
  const canvasRef = useRef();

  const wrapperRect = useWrapperRect((state) => state.wrapperRect);

  const scale = usePanning((state) => state.scale);
  const panOffsetCoords = usePanning((state) => state.panOffsetCoords);

  const GRID_SIZE = 50; // Distance in World Units between major grid lines

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    const scaledLineWidth = 0.5 * scale;
    const scaledGridSize = GRID_SIZE * scale;

    // We reset the matrix, clear, and then apply the matrix again.
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Style for the grid lines
    ctx.strokeStyle = "#a3b1c4ff";
    ctx.lineWidth = scaledLineWidth;

    // Robust calculation for starting grid line in Canvas Pixels
    const worldXAtCanvasZero = -panOffsetCoords.x / scale;
    const worldYAtCanvasZero = -panOffsetCoords.y / scale;
    const firstLineWorldX =
      Math.floor(worldXAtCanvasZero / GRID_SIZE) * GRID_SIZE;
    const firstLineWorldY =
      Math.floor(worldYAtCanvasZero / GRID_SIZE) * GRID_SIZE;
    const startPixelX = firstLineWorldX * scale + panOffsetCoords.x;
    const startPixelY = firstLineWorldY * scale + panOffsetCoords.y;

    // --- Draw Vertical Lines ---
    for (let x = startPixelX; x < WIDTH; x += scaledGridSize) {
      // Snap to half-pixel for 1px wide lines
      const snapX = Math.round(x) + 0.5;
      ctx.beginPath();
      ctx.moveTo(snapX, 0);
      ctx.lineTo(snapX, HEIGHT);
      ctx.stroke();
    }

    // --- Draw Horizontal Lines ---
    for (let y = startPixelY; y < HEIGHT; y += scaledGridSize) {
      // Snap to half-pixel for 1px wide lines
      const snapY = Math.round(y) + 0.5;
      ctx.beginPath();
      ctx.moveTo(0, snapY);
      ctx.lineTo(WIDTH, snapY);
      ctx.stroke();
    }
  }, [scale, panOffsetCoords, wrapperRect]);

  return (
    <canvas
      id="line-grid"
      ref={canvasRef}
      width={wrapperRect.width}
      height={wrapperRect.height}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 0,
      }}
    />
  );
};

export default LineGrid;
