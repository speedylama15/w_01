import React, { useEffect, useRef } from "react";

const node1 = {
  position: { x: 100, y: 100 },
  dimension: { width: 200, height: 200 },
};

const node2 = {
  position: { x: 500, y: 100 },
  dimension: { width: 200, height: 100 },
};

const drawSquare = (ctx, node, r = 10, count = 1) => {
  const { x, y } = node.position;
  const { width, height } = node.dimension;

  const cx1 = x + width / 3;
  const cx2 = x + (width * 2) / 3;
  const cy1 = y + height / 3;
  const cy2 = y + (height * 2) / 3;

  for (let i = 1; i <= count; i++) {
    const wobbliness = i * 10;
    const radius = r + i * 5;

    ctx.beginPath();

    ctx.moveTo(x + radius, y);

    ctx.quadraticCurveTo(cx1, y + wobbliness, x + width - radius, y);
    // ctx.bezierCurveTo(
    //   cx1,
    //   y + wobbliness,
    //   cx2,
    //   y - wobbliness,
    //   x + width - radius,
    //   y
    // );
    ctx.arcTo(x + width, y, x + width, y + radius, radius);

    ctx.bezierCurveTo(
      x + width + wobbliness,
      cy1,
      x + width - wobbliness,
      cy2,
      x + width,
      y + height - radius
    );
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);

    ctx.bezierCurveTo(
      cx1,
      y + height + wobbliness,
      cx2,
      y + height - wobbliness,
      x + radius,
      y + height
    );
    ctx.arcTo(x, y + height, x, y + height - radius, radius);

    ctx.bezierCurveTo(x + wobbliness, cy1, x - wobbliness, cy2, x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);

    ctx.closePath();
    ctx.stroke();
  }
};

const drawCircle = (ctx, node) => {
  const { x, y } = node.position;
  const { width: w, height: h } = node.dimension;

  const cx = x + w / 2;
  const cy = y + h / 2;
  const rx = w / 2;
  const ry = h / 2;

  const k = 0.5522847498;

  ctx.beginPath();
  ctx.moveTo(cx + rx, cy); // Start at right

  // Right to bottom
  ctx.bezierCurveTo(cx + rx, cy + ry * k, cx + rx * k, cy + ry, cx, cy + ry);

  // Bottom to left
  ctx.bezierCurveTo(cx - rx * k, cy + ry, cx - rx, cy + ry * k, cx - rx, cy);

  // Left to top
  ctx.bezierCurveTo(cx - rx, cy - ry * k, cx - rx * k, cy - ry, cx, cy - ry);

  // Top to right
  ctx.bezierCurveTo(cx + rx * k, cy - ry, cx + rx, cy - ry * k, cx + rx, cy);

  ctx.closePath();
  ctx.stroke();
};

const SampleShapes = () => {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    drawSquare(ctx, node1);
  }, []);

  return (
    <canvas
      width={1000}
      height={800}
      ref={canvasRef}
      style={{
        display: "flex",
        backgroundColor: "#d2d6eaff",
        margin: "30px auto",
      }}
    />
  );
};

export default SampleShapes;
