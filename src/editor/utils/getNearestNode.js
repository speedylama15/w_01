const getNearestNode = ($pos) => {
  for (let i = $pos.depth; i >= 0; i--) {
    const node = $pos.node(i);

    if (node.type.name === "doc") {
      break;
    }

    if (node.attrs.nodeType === "content" || node.attrs.nodeType === "block") {
      return { depth: i, node };
    }
  }

  return null;
};

export default getNearestNode;
