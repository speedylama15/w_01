export const getDepthByContentType = ($from, contentType) => {
  for (let i = $from.depth; i >= 0; i--) {
    const node = $from.node(i);

    if (node.type.name === "doc") {
      break;
    }

    if (node.attrs.contentType === contentType) {
      return { depth: i, node };
    }
  }

  return null;
};
