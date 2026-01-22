export const getByNodeType = ($from, nodeType) => {
  for (let i = $from.depth; i >= 0; i--) {
    const node = $from.node(i);

    if (node.type.name === "doc") {
      break;
    }

    if (node.attrs.nodeType === nodeType) {
      return { depth: i, node };
    }
  }

  return null;
};
