import Flatbush from "flatbush";

const getEditorTree = (view) => {
  const blocks = view.dom.querySelectorAll(".block");

  const tree = new Flatbush(blocks.length);

  blocks.forEach((block) => {
    const rect = block.getBoundingClientRect();

    const minX = rect.left;
    const maxX = rect.right;
    const minY = rect.top + window.scrollY;
    const maxY = rect.bottom + window.scrollY;

    tree.add(minX, minY, maxX, maxY);
  });

  tree.finish();

  return { blocks, tree };
};

export default getEditorTree;
