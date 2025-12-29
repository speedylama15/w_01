import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

import { clampMin } from "../../../utils/clampMin";

const ColumnResizingKey = new PluginKey("ColumnResizingKey");

export const ColumnResizing = new Plugin({
  key: ColumnResizingKey,

  // for actual dispatch
  // tr.setNodeMarkup
  appendTransaction(transactions, oldState, newState) {},

  state: {
    init() {
      return {
        isDraggingResizer: false,
        cellIndex: null,
        startX: null,
        startWidth: null,
        tableID: null,
        tableStartWidth: null,
      };
    },

    // idea: for altering state and reacting to them
    apply(tr, value, oldState, newState) {
      const resizeData = tr.getMeta("resize-data");

      if (resizeData) return resizeData;

      return value;
    },
  },

  props: {
    // decorations(state) {
    //   return this.getState(state);
    // },

    // idea: can dispatch tr to set meta or alter attributes
    handleDOMEvents: {
      mousedown(view, e) {
        const { dispatch } = view;
        const { tr } = view.state;

        const resizer = e.target.closest(".col-resizer");
        if (!resizer) return;
        const table = resizer.closest("table");
        if (!table) return;

        // fix: for the sake of implementation
        const cellIndex = 0;
        // fix

        const row = table.querySelector("tr");
        const cell = row.children[cellIndex]; // idea: DOM

        tr.setMeta("resize-data", {
          isDraggingResizer: true,
          cellIndex,
          startX: e.clientX,
          startWidth: parseInt(cell.getAttribute("colwidth")),
          tableID: table.getAttribute("data-id"),
          tableStartWidth: parseInt(window.getComputedStyle(table).minWidth),
        });

        dispatch(tr);
      },

      mousemove(view, e) {
        const { dispatch } = view;
        const { tr } = view.state;

        const {
          isDraggingResizer,
          cellIndex,
          startX,
          startWidth,
          tableID,
          tableStartWidth,
        } = ColumnResizingKey.getState(view.state);

        if (!isDraggingResizer) return;

        const table = document.querySelector(`table[data-id="${tableID}"]`);

        if (!table) return;

        const trs = Array.from(table.querySelectorAll("tr"));
        const cells = trs.map((tr) => tr.children[cellIndex]);

        if (!cells) return;

        const delta = e.clientX - startX;

        // todo: clamp this
        const colWidth = clampMin(startWidth + delta, 150);
        const tableWidth = tableStartWidth - startWidth + colWidth;

        cells.forEach((cell) => {
          const pos = view.posAtDOM(cell);
          const before = pos - 1;
          const node = view.state.doc.nodeAt(before);

          tr.setNodeMarkup(before, null, {
            ...node.attrs,
            // colwidth: [newCellWidth],
            colWidth,
          });
        });

        // update table width
        table.style.minWidth = tableWidth + "px";

        // update colgroup -> the colwidth of all the cell MUST be based on its colgroup's width or min-width
        // if min-width or width does not exist, then just default it to 150
        // const colgroup = table.querySelector("colgroup");
        // const col = colgroup.children[cellIndex];
        // col.style.width = newCellWidth + "px";

        dispatch(tr);
      },

      mouseup(view, e) {
        const { dispatch } = view;
        const { tr } = view.state;

        tr.setMeta("resize-data", {
          isDraggingResizer: false,
          cellIndex: null,
          startX: null,
          startWidth: null,
          tableID: null,
          tableStartWidth: null,
        });

        dispatch(tr);
      },
    },
  },

  view() {
    return {
      update(view, prevState) {},
    };
  },
});
