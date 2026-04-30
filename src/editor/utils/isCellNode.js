const isCellNode = (node) => {
  const name = node.type.name;

  if (name === "tableCell" || name === "tableHeader") {
    return true;
  }

  return false;
};

export default isCellNode;
