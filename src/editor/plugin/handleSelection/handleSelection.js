import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { Mapping } from "@tiptap/pm/transform";
import MultiSelection from "../../selection/MultiSelection";

import { trackActivityKey } from "../trackActivity/trackActivity";

const handleSelection = () => {
  return new Plugin({
    props: {
      createSelectionBetween(view, $anchor, $head) {
        const { operation } = trackActivityKey.getState(view.state);

        if (operation === "CELL_SELECTING") {
          return view.state.selection;
        }

        const from = Math.min($anchor.pos, $head.pos);
        const to = Math.max($anchor.pos, $head.pos);

        const map = {};

        view.state.doc.nodesBetween(from, to, (node) => {
          if (node.attrs.nodeType === "block") {
            const property = node.isTextblock ? "text" : "nonText";

            if (map[property]) {
              map[property] += 1;
            } else {
              map[property] = 1;
            }

            return false;
          }
        });

        if (map.text && map.nonText) {
          return MultiSelection.create(view.state.doc, from, to);
        }

        return null;
      },

      decorations(state) {
        const { selection } = state;
        const { from, to } = selection;

        if (from === to) return DecorationSet.empty;

        if (selection instanceof TextSelection) {
          const arr = [];

          state.doc.nodesBetween(from, to, (node, pos) => {
            if (
              // if it's a block and is a text block
              (node.attrs.nodeType === "block" && node.isTextblock) ||
              // or it's not a text block but the node is a table
              node.type.name === "table"
            ) {
              const dec = Decoration.node(pos, pos + node.nodeSize, {
                class: "active-node",
              });

              arr.push(dec);
            }
          });

          return DecorationSet.create(state.doc, arr);
        }

        if (selection instanceof MultiSelection) {
          const decs = selection.nodes.map((node) => {
            const { before, after } = node;

            const dec = Decoration.node(before, after, {
              class: "multi-selection",
            });

            return dec;
          });

          return DecorationSet.create(state.tr.doc, decs);
        }
      },

      handleTextInput(view, from, to, text) {
        console.log("handleTextInput", text);
      },

      handleDOMEvents: {
        beforeinput(view, e) {
          // e.preventDefault();
          console.log("beforeinput", view.state.selection, e);
        },
      },
    },
  });
};

export default handleSelection;
