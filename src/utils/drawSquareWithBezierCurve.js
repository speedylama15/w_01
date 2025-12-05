// debug: this is for testing purposes
// todo: need svg path
export const drawSquareWithBezierCurve = (ctx, node, radius = 10) => {
  const { x, y } = node.position;
  const { width, height } = node.dimension;

  const k = 0.5522847498;

  ctx.imageSmoothingEnabled = false;

  ctx.lineWidth = 3;
  ctx.strokeStyle = "salmon";

  ctx.beginPath();

  ctx.moveTo(x + radius, y);

  // ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width / 3, y + 10, x + width - radius, y);

  ctx.bezierCurveTo(
    x + width - radius + radius * k,
    y, // control point 1
    x + width,
    y + radius - radius * k, // control point 2
    x + width,
    y + radius // end point
  );

  // ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(
    x + width - 12,
    y + height / 4,
    x + width,
    y + height - radius
  );

  ctx.bezierCurveTo(
    x + width,
    y + height - radius + radius * k, // control point 1
    x + width - radius + radius * k,
    y + height, // control point 2
    x + width - radius,
    y + height // end point
  );

  // ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x + width / 2, y + height + 10, x + radius, y + height);

  ctx.bezierCurveTo(
    x + radius - radius * k,
    y + height, // control point 1
    x,
    y + height - radius + radius * k, // control point 2
    x,
    y + height - radius // end point
  );

  // ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x - 12, y + height / 5, x, y + radius);

  ctx.bezierCurveTo(
    x,
    y + radius - radius * k, // control point 1
    x + radius - radius * k,
    y, // control point 2
    x + radius,
    y // end point
  );

  ctx.closePath();
  ctx.stroke();

  ctx.imageSmoothingEnabled = true;
};
