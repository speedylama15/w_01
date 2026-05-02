const getPrevNode = (tr, pos) => {
  const $pos = tr.doc.resolve(pos);

  const node = $pos.nodeBefore;

  if (!node) return null;

  const before = pos - node.nodeSize;
  const after = $pos.pos;

  return { node, before, after };
};

export default getPrevNode;
