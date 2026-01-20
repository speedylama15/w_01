import RBush from "rbush";
import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import { DecorationSet } from "@tiptap/pm/view";
import { MultipleNodeSelection } from "../../selections/MultipleNodeSelection";

const getBlockDOMBoxes = (view) => {
  const blocks = view.dom.querySelectorAll(".block");

  const arr = [];

  blocks.forEach((block) => {
    const rect = block.getBoundingClientRect();

    const minX = rect.left;
    const maxX = rect.right;
    const minY = rect.top + window.scrollY;
    const maxY = rect.bottom + window.scrollY;

    arr.push({ minX, maxX, minY, maxY, dom: block });
  });

  return arr;
};

const getBlockNodeBoxes = (view) => {
  const obj = {};

  view.state.tr.doc.descendants((node, pos) => {
    if (node?.attrs.divType === "block") {
      const before = pos;
      const after = before + node.nodeSize;

      obj[node.attrs.id] = { before, after, node };

      return false;
    }
  });

  return obj;
};

// todo: I could mark which dom or node is a table

export const SelectionControlKey = new PluginKey("SelectionControlKey");

export const SelectionControl = new Plugin({
  key: SelectionControlKey,

  state: {
    init() {
      return DecorationSet.empty;
    },

    apply(tr, value) {
      const woah = tr.getMeta("woah");

      if (woah) return woah;

      return value;
    },
  },

  props: {
    decorations(state) {
      return this.getState(state);
    },
  },

  view(view) {
    let blockDOMBoxesArr = null;
    let blockNodeBoxesObj = null;
    let isMouseDown = false;
    let startCoords = null;
    let currentCoords = null;
    let tree = new RBush();

    const handleMouseDown = (e) => {
      blockDOMBoxesArr = getBlockDOMBoxes(view);
      blockNodeBoxesObj = getBlockNodeBoxes(view);
      isMouseDown = true;

      tree.load(blockDOMBoxesArr);

      const coords = { x: e.clientX, y: e.clientY + window.scrollY };

      startCoords = coords;
      currentCoords = coords;
    };

    const handleMouseMove = (e) => {
      if (!isMouseDown) return;

      window.getSelection().removeAllRanges();

      // currentCoords = { x: e.clientX, y: e.clientY + window.scrollY };

      // const minX = Math.min(startCoords.x, currentCoords.x);
      // const maxX = Math.max(startCoords.x, currentCoords.x);
      // const minY = Math.min(startCoords.y, currentCoords.y);
      // const maxY = Math.max(startCoords.y, currentCoords.y);

      // const box = { minX, maxX, minY, maxY };

      // const result = tree.search(box);

      // console.log("result", result);
    };

    const handleMouseUp = () => {
      blockDOMBoxesArr = null;
      blockNodeBoxesObj = null;
      isMouseDown = false;

      tree.clear();
    };

    view.dom.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return {
      destroy() {
        view.dom.removeEventListener("mousedown", handleMouseDown);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      },
    };
  },
});
