const isClickOrDrag = (
  startCoords,
  currentCoords,
  threshold,
  xAccessor = (obj) => {
    return obj.x;
  },
  yAccessor = (obj) => {
    return obj.y;
  },
) => {
  const distance =
    Math.pow(Math.abs(xAccessor(currentCoords) - xAccessor(startCoords)), 2) +
    Math.pow(Math.abs(yAccessor(currentCoords) - yAccessor(startCoords)), 2);

  if (distance > Math.pow(threshold, 2)) return "drag";

  return "click";
};

export default isClickOrDrag;
