export const getWorldCoords = (e, panOffsetCoords, scale, wrapperRect) => {
  const { clientX, clientY } = e;

  const x = (clientX - wrapperRect.x - panOffsetCoords.x) / scale;
  const y = (clientY - wrapperRect.y - panOffsetCoords.y) / scale;

  return { x, y };
};
