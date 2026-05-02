const getNextNode = (tr, pos) => {
  const $pos = tr.doc.resolve(pos);

  const node = $pos.nodeAfter;

  if (!node) return null;

  const before = $pos.pos;
  const after = $pos.pos + node.nodeSize;

  return { node, before, after };
};

export default getNextNode;
