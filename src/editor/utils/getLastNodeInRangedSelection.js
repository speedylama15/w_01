const getLastNodeInRangedSelection = (tr, from, to) => {
  let lastNode = null;

  tr.doc.nodesBetween(from, to, (node, pos) => {
    if (node.attrs.nodeType === "block") {
      lastNode = { node, pos };

      if (node.type.name !== "table") return false;
    }

    if (node.type.name === "tableCell" || node.type.name === "tableHeader") {
      lastNode = { node, pos };

      return false;
    }
  });

  return lastNode;
};

export default getLastNodeInRangedSelection;
