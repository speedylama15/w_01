import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import MultiSelection from "../../selection/MultiSelection";

import { trackActivityKey } from "../trackActivity/trackActivity";
// import { cellSelectingKey } from "../cellSelecting/cellSelecting";

const getProperty = (name) => {
  if (name === "table") return "table";
  if (name === "tableCell" || name === "tableHeader") return "cell";

  return "other";
};

const handleSelection = () => {
  return new Plugin({
    props: {
      createSelectionBetween(view, $anchor, $head) {
        if ($anchor.pos === $head.pos) return null;

        const { operation } = trackActivityKey.getState(view.state);

        console.log({ anchor: $anchor.pos, head: $head.pos });

        // const { pos, node } = cellSelectingKey.getState(view.state);
        // if (node) {
        //   const from = Math.min($anchor.pos, $head.pos);
        //   const to = Math.max($anchor.pos, $head.pos);

        //   const start = Math.max(pos, from);
        //   const end = Math.min(pos + node.nodeSize, to);

        //   return TextSelection.create(view.state.doc, start, end);
        // }

        if (operation === "CELL_SELECTING") return view.state.selection;

        const from = Math.min($anchor.pos, $head.pos);
        const to = Math.max($anchor.pos, $head.pos);
        const obj = {};

        view.state.doc.nodesBetween(from, to, (node) => {
          const name = node.type.name;
          const property = getProperty(name);

          if (node.attrs.nodeType === "block") {
            if (obj[property]) {
              obj[property] += 1;
            } else {
              obj[property] = 1;
            }
          }

          // ignore tableRow and allow the loop to reach tableCell/Header
          if (
            node.type.name === "tableCell" ||
            node.type.name === "tableHeader"
          ) {
            if (obj[property]) {
              obj[property] += 1;
            } else {
              obj[property] = 1;
            }

            return false;
          }
        });

        // this is bad selection, therefore convert the selection to MultiSelection
        if (
          // obj.cell > 1 ||
          obj.table &&
          obj.other
        ) {
          const multi = MultiSelection.create(view.state.doc, from, to);

          return multi;
        } else {
          return null;
        }
      },

      decorations(state) {
        const { selection } = state;
        const { from, to } = selection;

        // const { node, pos } = cellSelectingKey.getState(state);
        // if (node && selection instanceof TextSelection) {
        //   const dec = Decoration.node(pos, pos + node.nodeSize, {
        //     class: "active-node",
        //   });

        //   const set = DecorationSet.create(state.doc, [dec]);

        //   return set;
        // }

        if (from === to) return DecorationSet.empty;

        if (selection instanceof TextSelection) {
          const arr = [];

          state.doc.nodesBetween(from, to, (node, pos) => {
            if (node.attrs.nodeType === "block") {
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

      // createSelectionBetween(view, $anchor, $head) {
      //   const from = Math.min($anchor.pos, $head.pos);
      //   const to = Math.max($anchor.pos, $head.pos);
      //   const obj = {};

      //   view.state.doc.nodesBetween(from, to, (node, pos) => {
      //     if (node.attrs.nodeType === "block") {
      //       const { name } = node.type;

      //       console.log(name);

      //       obj[pos] = name;

      //       return false;
      //     }
      //   });

      //   console.log("CREATESELECTIONBETWEEN", obj);

      //   // const range = new Range();
      //   // const fromData = view.domAtPos(from);
      //   // const toData = view.domAtPos(to);
      //   // range.setStart(fromData.node, fromData.offset);
      //   // range.setEnd(toData.node, toData.offset);

      //   // const highlight = new Highlight(range);
      //   // CSS.highlights.set("my-highlight", highlight);

      //   return null;
      // },
    },
  });
};

export default handleSelection;
