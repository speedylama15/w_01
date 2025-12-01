// idea: I am going to have to the know the node's type
// idea: is it a square, rounded square, triangle, or a circle? What is it?
export const getCornerCoords = (node) => {
  const { position, dimension, rotation } = node;

  const { x, y } = position;
  const { width, height } = dimension;

  const centerX = x + width / 2;
  const centerY = y + height / 2;

  const corners = {
    lx: { x, y },
    rx: { x: x + width, y: y },
    bl: { x: x, y: y + height },
    br: { x: x + width, y: y + height },
  };
};
