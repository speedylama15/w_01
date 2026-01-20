import { rotateCoords } from "./rotateCoords";

const getTLXY = (x, y, width, height, unrotatedMouseCoords, location) => {
  const data = {
    "bottom-right": { x, y },
    "bottom-left": { x: unrotatedMouseCoords.x, y },
    "top-right": { x, y: unrotatedMouseCoords.y },
    "top-left": { x: unrotatedMouseCoords.x, y: unrotatedMouseCoords.y },
    top: { x, y: unrotatedMouseCoords.y },
    right: { x, y },
    bottom: { x, y },
    left: { x: unrotatedMouseCoords.x, y },
  };

  return data[location];
};

const getBRXY = (x, y, width, height, unrotatedMouseCoords, location) => {
  const data = {
    "bottom-right": {
      x: unrotatedMouseCoords.x,
      y: unrotatedMouseCoords.y,
    },
    "bottom-left": {
      x: x + width,
      y: unrotatedMouseCoords.y,
    },
    "top-right": {
      x: unrotatedMouseCoords.x,
      y: y + height,
    },
    "top-left": {
      x: x + width,
      y: y + height,
    },
    top: {
      x: x + width,
      y: y + height,
    },
    right: {
      x: unrotatedMouseCoords.x,
      y: y + height,
    },
    bottom: {
      x: x + width,
      y: unrotatedMouseCoords.y,
    },
    left: {
      x: x + width,
      y: y + height,
    },
  };

  return data[location];
};

export const handleSingleResize = (initNode, mouseCoords, location) => {
  const { position, dimension, rotation } = initNode;
  const { x, y } = position;
  const { width, height } = dimension;

  const oldCenter = {
    x: x + width / 2,
    y: y + height / 2,
  };

  const unrotatedMouseCoords = rotateCoords(mouseCoords, oldCenter, -rotation);

  const TLXY = getTLXY(x, y, width, height, unrotatedMouseCoords, location);
  const BRXY = getBRXY(x, y, width, height, unrotatedMouseCoords, location);

  const rotatedTLXY = rotateCoords(TLXY, oldCenter, rotation);
  const rotatedBRXY = rotateCoords(BRXY, oldCenter, rotation);

  const newCenter = {
    x: (rotatedBRXY.x + rotatedTLXY.x) / 2,
    y: (rotatedBRXY.y + rotatedTLXY.y) / 2,
  };

  const unrotatedTLXY = rotateCoords(rotatedTLXY, newCenter, -rotation);
  const unrotatedBRXY = rotateCoords(rotatedBRXY, newCenter, -rotation);

  const minX = Math.min(unrotatedTLXY.x, unrotatedBRXY.x);
  const maxX = Math.max(unrotatedTLXY.x, unrotatedBRXY.x);
  const minY = Math.min(unrotatedTLXY.y, unrotatedBRXY.y);
  const maxY = Math.max(unrotatedTLXY.y, unrotatedBRXY.y);

  return { minX, maxX, minY, maxY };
};
