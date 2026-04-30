const isListNode = (node) => {
  const name = node.type.name;

  if (
    name === "bulletList" ||
    name === "numberedList" ||
    name === "checklist"
  ) {
    return true;
  }

  return false;
};

export default isListNode;
