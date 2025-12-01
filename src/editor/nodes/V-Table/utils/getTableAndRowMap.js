const getTableAndRowMap = (tableNode, tablePos) => {
  const tableMap = {};
  const rowMap = {};
  let num = 0;

  // relative
  tableNode.descendants((node, pos, parent, index) => {
    if (node.type.name === "vRow") {
      rowMap[num] = node.attrs.id;

      num++;
    }

    if (node.attrs.contentType === "vCell") {
      const parentID = parent.attrs.id;

      if (tableMap[parentID]) {
        tableMap[parentID].push({
          pos: pos + tablePos + 1,
          cellID: node.attrs.id,
        });
      } else {
        tableMap[parentID] = [
          { pos: pos + tablePos + 1, cellID: node.attrs.id },
        ];
      }

      return false;
    }
  });

  return { tableMap, rowMap };
};

export default getTableAndRowMap;
