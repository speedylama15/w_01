import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { CellSelection } from "@tiptap/pm/tables";

import { getDepth } from "../../utils/getDepth";

// idea: perhaps I can export this?
export const CellSelectingKey = new PluginKey("CellSelectingKey");

export const CellSelecting = new Plugin({
  key: CellSelectingKey,

  state: {
    init() {
      const state = {
        selectionBoxSet: DecorationSet.empty,
      };

      return state;
    },

    apply(tr, value, oldState, newState) {
      const hideSelectionBox = tr.getMeta("hide-selection-box");
      const displaySelectionBox = tr.getMeta("display-selection-box");

      if (displaySelectionBox) {
        const { from, to, node } = displaySelectionBox;

        const decoration = Decoration.node(from, to, {
          "data-display-selection-box": node.attrs.id,
        });

        return {
          ...value,
          selectionBoxSet: DecorationSet.create(newState.doc, [decoration]),
        };
      }

      return value;
    },
  },

  props: {
    decorations(state) {
      return this.getState(state).selectionBoxSet;
    },

    handleDOMEvents: {
      mousedown(view, e) {
        const { dispatch } = view;
        const { tr } = view.state;

        const td = e.target.closest("td");

        if (!td) {
          tr.setMeta("hide-selection-box", true);

          dispatch(tr);

          return false;
        }

        const before = view.posAtDOM(td) - 1;
        const node = view.state.doc.nodeAt(before);
        const after = before + node.nodeSize;

        tr.setMeta("display-selection-box", { from: before, to: after, node });

        dispatch(tr);

        return true;
      },
    },
  },
});
