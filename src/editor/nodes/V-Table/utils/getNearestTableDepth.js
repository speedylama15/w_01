const getNearestTableDepth = ($from) => {
  let depth = 0;

  for (let i = $from.depth; i > 0; i--) {
    const n = $from.node(i);

    if (!n) {
      depth = 0;
      break;
    }

    if (n.attrs.contentType === "vTable") {
      depth = i;
      break;
    }
  }

  return depth;
};

export default getNearestTableDepth;
