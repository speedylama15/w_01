export const getDepthByContent = ($from, contentType) => {
  let depth = $from.depth;

  for (let i = $from.depth; i >= 0; i--) {
    const node = $from.node(i);

    if (!node) {
      // fix
      console.log("something has gone wrong");

      break;
    }

    if (node.attrs.contentType === contentType || node.type.name === "doc") {
      depth = i;

      break;
    }
  }

  return depth;
};
