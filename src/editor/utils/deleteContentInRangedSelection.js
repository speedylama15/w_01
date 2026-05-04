const deleteContentInRangedSelection = (tr, from, to) => {
  tr.doc.nodesBetween(from, to, (node, pos) => {
    // delete block
    if (node.attrs.nodeType === "block") {
      const nodeBefore = pos;
      const nodeAfter = pos + node.nodeSize;

      if (nodeBefore >= from && nodeAfter <= to) {
        const mappedBefore = tr.mapping.map(pos);
        const mappedAfter = tr.mapping.map(pos + node.nodeSize);

        tr.delete(mappedBefore, mappedAfter);

        return false;
      }
    }

    // delete table block
    if (node.type.name === "table") {
      const textBefore = pos + 4;
      const textAfter = pos + node.nodeSize - 4;

      // review: use raw pos in conditions
      if (textBefore >= from && textAfter <= to) {
        const nodeBefore = pos;
        const nodeAfter = pos + node.nodeSize;

        // review: use mapping in actual operation
        tr.delete(tr.mapping.map(nodeBefore), tr.mapping.map(nodeAfter));

        return false;
      }
    }

    if (node.type.name === "tableRow") {
      const nodeBefore = pos;
      const nodeAfter = pos + node.nodeSize;

      if (nodeBefore >= from && nodeAfter <= to) {
        tr.delete(tr.mapping.map(nodeBefore), tr.mapping.map(nodeAfter));

        return false;
      }
    }

    // corresponding table block has not been deleted
    // empty out the cells or let it move on to the text node
    if (node.type.name === "tableCell" || node.type.name === "tableHeader") {
      const textBefore = pos + 2;
      const textAfter = pos + node.nodeSize - 2;

      // blue highlight is completely within the cell
      // from is in between the text's before and after
      // to is in between the text's before and after
      if (
        (from >= textBefore && to <= textAfter) ||
        (from >= textBefore && from <= textAfter) ||
        (to >= textBefore && to <= textAfter)
      ) {
        // let it go to the text node
        return true;
      } else {
        // otherwise, empty out the cell
        // but do not delete the paragraph item
        // it does not matter if I use pos + 1 or pos + 2 and its respective end pos
        tr.deleteRange(tr.mapping.map(textBefore), tr.mapping.map(textAfter));

        return false;
      }
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
