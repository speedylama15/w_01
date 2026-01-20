import { getWorldCoords } from "./getWorldCoords";

export const getWrapperBox = (panOffsetCoords, scale, wrapperRect) => {
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

  return WRAPPERBOX;
};
