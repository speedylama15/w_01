import Flatbush from "flatbush";

const getBlocksData = (doc) => {
  const blockDOMs = document.querySelectorAll(".block");
  const tree = new Flatbush(blockDOMs.length);

  const doms = [];
  const nodes = [];

  blockDOMs.forEach((blockDOM) => {
    const rect = blockDOM.getBoundingClientRect();

    const minX = rect.left;
    const maxX = rect.right;
    const minY = rect.top + window.scrollY;
    const maxY = rect.bottom + window.scrollY;

    doms.push({
      dom: blockDOM,
      top: minY,
      right: maxX,
      bottom: maxY,
      left: minX,
    });

    tree.add(minX, minY, maxX, maxY);
  });

  tree.finish();

  doc.descendants((node, pos) => {
    if (node.attrs.nodeType === "block") {
      nodes.push({ node, before: pos, after: pos + node.nodeSize });

      return false;
    }
  });

  return { tree, doms, nodes };
};

export default getBlocksData;
