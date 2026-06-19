import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { Mapping } from "@tiptap/pm/transform";
import MultiSelection from "../../selection/MultiSelection";

import { trackActivityKey } from "../trackActivity/trackActivity";

import { fixTable } from "../../utils";

const getProperty = (name) => {
  if (name === "table") return "table";
  if (name === "tableCell" || name === "tableHeader") return "cell";

  return "other";
};

const isRangeInRange = (inner, outer) => {
  return inner.start >= outer.start && inner.end <= outer.end;
};

const handleSelection = () => {
  return new Plugin({
    appendTransaction(transactions, oldState, newState) {
      const docChanged = transactions.find((tr) => tr.docChanged);

      if (docChanged) {
        const { doc, selection } = oldState;
        const { from, to } = selection;

        const mapping = new Mapping();
        transactions.forEach((tr) => mapping.appendMapping(tr.mapping));

        const positions = [];

        doc.nodesBetween(from, to, (node, pos) => {
          if (node.attrs.nodeType === "block") {
            const before = pos;
            const after = pos + node.nodeSize;

            const isInRange = isRangeInRange(
              { start: before, end: after },
              { start: from, end: to },
            );

            if (!isInRange && node.type.name === "table") {
              positions.push(pos);
            }

            return false;
          }
        });

        if (positions.length > 0) {
          const existingPositions = positions.filter((pos) => {
            if (!mapping.mapResult(pos).deleted) return pos;
          });

          console.log(existingPositions);
        }
      }
    },

    props: {
      createSelectionBetween(view, $anchor, $head) {
        const from = Math.min($anchor.pos, $head.pos);
        const to = Math.max($anchor.pos, $head.pos);

        console.log("selection", { from, to });
        return null;
      },

      decorations(state) {
        const { selection } = state;
        const { from, to } = selection;

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
    },
  });
};

export default handleSelection;
