const getFirstNodeInRangedSelection = (tr, from, to) => {
  let firstNode = null;

  tr.doc.nodesBetween(from, to, (node, pos) => {
    if (node.attrs.nodeType === "block") {
      if (!firstNode) {
        if (node.type.name !== "table") {
          firstNode = { node, before: pos };

          return false;
        }
      }
    }

    if (node.type.name === "tableCell" || node.type.name === "tableHeader") {
      if (!firstNode) firstNode = { node, before: pos };

      return false;
    }
  });

  return firstNode;
};

export default getFirstNodeInRangedSelection;
