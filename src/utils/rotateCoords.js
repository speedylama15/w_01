// -angle to unrotate/inverse
export const rotateCoords = (point, center, angle) => {
  const dx = point.x - center.x;
  const dy = point.y - center.y;

  const cosAngle = Math.cos(angle);
  const sinAngle = Math.sin(angle);

  const rotatedDx = dx * cosAngle - dy * sinAngle;
  const rotatedDy = dx * sinAngle + dy * cosAngle;

  return {
    x: center.x + rotatedDx,
    y: center.y + rotatedDy,
  };
};
