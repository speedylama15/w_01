import { Extension } from "@tiptap/core";
import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import { CellSelection } from "@tiptap/pm/tables";
import { getNearestBlockDepth } from "../../utils/getNearestBlockDepth";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { getDepth } from "../../utils/getDepth";

const TableSelectionPluginKey = new PluginKey("TableSelectionPluginKey");

const TableSelectionPlugin = new Plugin({
  key: TableSelectionPluginKey,

  // for actual dispatch
  // tr.setNodeMarkup
  appendTransaction(transactions, oldState, newState) {},

  state: {
    init() {
      return DecorationSet.empty;
    },

    // returning new state
    apply(tr, value, oldState, newState) {
      const selectSingleCell = tr.getMeta("select-single-cell");
      const selectOthers = tr.getMeta("select-others");

      if (selectSingleCell) {
        const { cellID, cellBefore, cellNode } = selectSingleCell;

        const deco = Decoration.node(
          cellBefore,
          cellBefore + cellNode.nodeSize,
          {
            "data-cell-id": cellID,
          }
        );

        return DecorationSet.create(newState.doc, [deco]);
      }

      if (selectOthers) {
        return DecorationSet.empty;
      }

      return value;
    },
  },

  props: {
    decorations(state) {
      return this.getState(state);
    },

    handleClick(view, pos, e) {
      const { tr } = view.state;
      const { dispatch } = view;
      const { $from } = view.state.selection;

      const td = e.target.closest("td");

      if (td) {
        // gives the start of the cell/td DOM
        const cellStart = view.posAtDOM(td);
        const cellBefore = cellStart - 1;
        const cellNode = view.state.doc.nodeAt(cellBefore);

        const cellID = td.getAttribute("data-id");
        const depth = getDepth($from, "block");
        const tableNode = $from.node(depth);
        const tableBefore = $from.before(depth);

        tr.setMeta("select-single-cell", {
          tableBefore,
          tableNode,
          cellID,
          cellBefore,
          cellNode,
        });

        dispatch(tr);
      } else {
        tr.setMeta("select-others", true);
        dispatch(tr);
      }

      return true;
    },

    handleDOMEvents: {
      // mousedown(view, e) {},
      // mousemove(view, e) {},
      // mouseup(view, e) {},
    },
  },

  view() {
    return {
      update(view, prevState) {},
    };
  },
});

export const Plugins = Extension.create({
  addProseMirrorPlugins() {
    return [TableSelectionPlugin];
  },
});
