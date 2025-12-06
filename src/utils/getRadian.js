export const getRadian = (e, id) => {
  const nodeDOM = document.querySelector(`[data-node-id="${id}"]`);
  const nodeRect = nodeDOM.getBoundingClientRect();

  const centerX = nodeRect.left + nodeRect.width / 2;
  const centerY = nodeRect.top + nodeRect.height / 2;

  let angle = Math.atan2(e.pageX - centerX, -(e.pageY - centerY));
  if (angle < 0) angle += 2 * Math.PI;

  return angle;
};
