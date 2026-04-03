import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { Plugin } from "@tiptap/pm/state";
import Flatbush from "flatbush";

import { MultiBlockSelection } from "../../selections/MultiBlockSelection";

import dragAndDropStore from "./dragAndDropStore";

import { isLeftClick } from "../../../utils";
import { Fragment } from "@tiptap/pm/model";

// todo: need a util method for indentLevel (clamping from 0 to 12)

const EDITOR_DRAG_AND_DROP = "EDITOR_DRAG_AND_DROP";

const getEditorTree = () => {
  const blocks = document.querySelectorAll(".block");
  const tree = new Flatbush(blocks.length);

  const parentRect = blocks[0].parentNode.getBoundingClientRect();
  const baseTop = parentRect.top + window.scrollY;
  const baseLeft = parentRect.left;

  blocks.forEach((block) => {
    const minX = baseLeft + block.offsetLeft;
    const maxX = baseLeft + block.offsetLeft + block.offsetWidth;
    const minY = baseTop + block.offsetTop;
    const maxY = baseTop + block.offsetTop + block.offsetHeight;

    tree.add(minX, minY, maxX, maxY);
  });

  tree.finish();

  return { blocks, tree };
};

const mapSelectedChunk = (selection) => {
  const map = {};

  selection.blocks.forEach((block) => {
    map[block.attrs.id] = true;
  });

  return map;
};

const DragAndDrop_Plugin = (editor) => {
  return new Plugin({
    props: {
      decorations(state) {
        return this.getState(state);
      },
    },

    state: {
      init() {
        return DecorationSet.empty;
      },

      apply(tr, value) {
        const decorations = tr.getMeta(EDITOR_DRAG_AND_DROP);

        if (decorations) return decorations;

        return value;
      },
    },

    view(view) {
      let insertPos = null; // idea: maybe I should change this to a state?

      const handleMouseDown = (e) => {
        if (!isLeftClick(e)) return;

        // distance estimation is not needed
        // radial menu -> drag and drop

        e.preventDefault(); // prevent default behavior

        const { tr } = view.state;
        const { dispatch } = view;
        const {
          setOperation,
          setEditorTree,
          setEditorBlocks,
          setSelectedChunkMap,
        } = dragAndDropStore.getState();

        setOperation(EDITOR_DRAG_AND_DROP); // fix

        // 1. set selection to MultiBlockSelection
        const multi = MultiBlockSelection.create(tr.doc, 20, 30); // fix
        tr.setSelection(multi);

        // 2. set up shadow DOM
        const { blocks, tree } = getEditorTree();
        setEditorBlocks(blocks);
        setEditorTree(tree);

        const map = mapSelectedChunk(multi);
        setSelectedChunkMap(map);

        dispatch(tr);
      };

      const handleMouseMove = (e) => {
        const { tr } = view.state;
        const { dispatch } = view;
        const { operation, editorTree, editorBlocks, selectedChunkMap } =
          dragAndDropStore.getState();

        if (operation !== EDITOR_DRAG_AND_DROP) return;
        if (!editorTree) return;

        e.preventDefault();

        const result = editorTree.search(
          e.pageX - Infinity,
          e.pageY - 3,
          e.pageX + Infinity,
          e.pageY + 3,
        );

        // if result does not exist, remove
        if (result.length === 0) {
          dispatch(tr.setMeta(EDITOR_DRAG_AND_DROP, DecorationSet.empty));
          insertPos = null;
          return;
        }

        const index = result[0];

        const currDOM = editorBlocks[index];
        const currID = currDOM.getAttribute("data-id");
        const currRect = currDOM.getBoundingClientRect();

        if (selectedChunkMap[currID]) {
          dispatch(tr.setMeta(EDITOR_DRAG_AND_DROP, DecorationSet.empty));
          insertPos = null;
          return;
        }

        const top = currRect.top + window.scrollY;
        const bottom = currRect.bottom + window.scrollY;
        const left = currRect.left;

        const horizontalLine = (top + bottom) / 2;
        const verticalLine = left + 100;

        let baseIndex = index;
        let isTop = false;
        let isLeft = false;

        if (e.pageY <= horizontalLine) {
          isTop = true;
          baseIndex--; // decrement to access the dom above
        }

        if (e.pageX <= verticalLine) {
          isLeft = true;
        }

        const baseDOM = editorBlocks[baseIndex === -1 ? 0 : baseIndex];
        const baseID = baseDOM.getAttribute("data-id");

        if (selectedChunkMap[baseID]) {
          dispatch(tr.setMeta(EDITOR_DRAG_AND_DROP, DecorationSet.empty));
          insertPos = null;
          return;
        }

        const before = view.posAtDOM(baseDOM) - 1;
        const node = view.state.doc.nodeAt(before);
        const after = before + node.nodeSize;
        insertPos = isTop && baseIndex === -1 ? before : after;
        const widgetTop =
          isTop && baseIndex === -1
            ? baseDOM.offsetTop - 1
            : baseDOM.offsetTop + baseDOM.offsetHeight + 1;
        const widgetLeft = baseDOM.offsetLeft;
        const widgetWidth = baseDOM.offsetWidth;

        const decoration = Decoration.widget(insertPos, () => {
          const line = document.createElement("div");

          line.style.cssText = `
                background: ${"black"};
                position: absolute;
                top: ${widgetTop}px;
                left: ${widgetLeft}px;
                width: ${widgetWidth}px; 
                height: 2px; 
                transform: translateY(-50%);
            `;

          return line;
        });

        tr.setMeta(
          EDITOR_DRAG_AND_DROP,
          DecorationSet.create(tr.doc, [decoration]),
        );

        dispatch(tr);
      };

      const handleMouseUp = () => {
        const { tr, selection } = view.state;
        const { dispatch } = view;

        const {
          operation,
          setOperation,
          setEditorBlocks,
          setEditorTree,
          setSelectedChunkMap,
        } = dragAndDropStore.getState();

        if (operation === EDITOR_DRAG_AND_DROP) {
          if (insertPos !== null) {
            const anchor = selection.anchor;
            const head = selection.head;

            const fragment = Fragment.from(tr.selection.blocks);

            tr.insert(tr.mapping.map(insertPos), fragment);
            tr.setSelection(
              MultiBlockSelection.create(
                tr.doc,
                insertPos,
                insertPos + (head - anchor),
              ),
            );

            selection.positions.forEach((position) => {
              const { before, after } = position;
              tr.delete(tr.mapping.map(before), tr.mapping.map(after));
            });
          }

          setOperation(null);
          setEditorBlocks(null);
          setEditorTree(null);
          setSelectedChunkMap(null);

          tr.setMeta(EDITOR_DRAG_AND_DROP, DecorationSet.empty);

          dispatch(tr);
        }
      };

      document.addEventListener("mousedown", handleMouseDown);
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return {
        destroy() {
          document.removeEventListener("mousedown", handleMouseDown);
          document.removeEventListener("mousemove", handleMouseMove);
          document.removeEventListener("mouseup", handleMouseUp);
        },
      };
    },
  });
};

export default DragAndDrop_Plugin;
