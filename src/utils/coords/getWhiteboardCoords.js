export const getWhiteboardCoords = (e, panOffsetCoords, scale, wrapperRect) => {
  const clickX = e.clientX - wrapperRect.x;
  const clickY = e.clientY - wrapperRect.y;

  const x = Math.floor((clickX - panOffsetCoords.x) / scale);
  const y = Math.floor((clickY - panOffsetCoords.y) / scale);

  return { x, y };
};
