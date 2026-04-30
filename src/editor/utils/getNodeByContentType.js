const getNodeByContentType = ($pos, contentType) => {
  for (let i = $pos.depth; i >= 0; i--) {
    const node = $pos.node(i);

    if (node.type.name === "doc") {
      break;
    }

    if (node.attrs.contentType === contentType) {
      return { depth: i, node };
    }
  }

  return null;
};

export default getNodeByContentType;
