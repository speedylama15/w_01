export const getWorldCoords = (coords, panOffsetCoords, scale, wrapperRect) => {
  const x = (coords.x - wrapperRect.x - panOffsetCoords.x) / scale;
  const y = (coords.y - wrapperRect.y - panOffsetCoords.y) / scale;

  return { x, y };
};
