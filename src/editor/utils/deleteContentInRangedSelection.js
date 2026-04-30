const deleteContentInRangedSelection = (tr, from, to) => {
  tr.doc.nodesBetween(from, to, (node, pos) => {
    // delete block
    if (node.attrs.nodeType === "block") {
      const node_bef = pos;
      const node_aft = pos + node.nodeSize;

      if (node_bef >= from && node_aft <= to) {
        const mapped_b = tr.mapping.map(pos);
        const mapped_a = tr.mapping.map(pos + node.nodeSize);

        tr.delete(mapped_b, mapped_a);

        return false;
      }
    }

    // delete table block
    if (node.type.name === "table") {
      const text_bef = pos + 4;
      const text_aft = pos + node.nodeSize - 4;

      // review: use raw pos in conditions
      if (text_bef >= from && text_aft <= to) {
        const node_b = pos;
        const node_a = pos + node.nodeSize;

        // review: use mapping in actual operation
        tr.delete(tr.mapping.map(node_b), tr.mapping.map(node_a));

        return false;
      }
    }

    // corresponding table block has not been deleted
    // empty out the cells or let it move on to the text node
    if (node.type.name === "tableCell" || node.type.name === "tableHeader") {
      const text_bef = pos + 2;
      const text_aft = pos + node.nodeSize - 2;

      // if from and to wraps text's before and after
      // that means, I need to delete the texts of the cell
      if (from >= text_bef && to <= text_aft) {
        // let is go to the text node
        return true;
      }

      // otherwise, empty out the cell
      // but do not delete the paragraph item
      // it does not matter if I use pos + 1 or pos + 2 and its respective end pos
      tr.deleteRange(tr.mapping.map(text_bef), tr.mapping.map(text_aft));

      return false;
    }

    // delete the texts
    if (node.type.name === "text") {
      tr.deleteRange(
        tr.mapping.map(Math.max(pos, from)),
        tr.mapping.map(Math.min(pos + node.nodeSize, to)),
      );
    }
  });
};

export default deleteContentInRangedSelection;
