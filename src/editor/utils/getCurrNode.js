import getNearestNode from "./getNearestNode";
import getNodeByNodeType from "./getNodeByNodeType";

const getCurrNode = ($pos, type) => {
  let result = null;

  if (type === "node") result = getNearestNode($pos);
  if (type === "block") result = getNodeByNodeType($pos, type);

  if (!result) return null;

  const { node, depth } = result;
  const before = $pos.before(depth);
  const after = before + node.nodeSize;

  return { node, before, after, depth };
};

export default getCurrNode;
