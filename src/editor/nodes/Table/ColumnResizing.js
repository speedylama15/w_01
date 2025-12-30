import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

import { clampMin } from "../../../utils/clampMin";

export const ColumnResizingKey = new PluginKey("ColumnResizingKey");

export const ColumnResizing = new Plugin({
  key: ColumnResizingKey,

  state: {
    init() {
      const state = {
        isDraggingResizer: false,
        isResizerDisplayed: false,

        cellIndex: null,
        startX: null,
        startWidth: null,

        tableID: null,
        tableStartWidth: null,

        resizerDecorationSet: DecorationSet.empty,
      };

      return state;
    },

    // idea: for altering state and reacting to them
    apply(tr, value, oldState, newState) {
      const resizeData = tr.getMeta("resize-data");
      const hideResizer = tr.getMeta("hide-resizer");
      const displayResizer = tr.getMeta("display-resizer");

      if (hideResizer) {
        return { ...value, resizerDecorationSet: DecorationSet.empty };
      }

      if (displayResizer) {
        const { isResizerDisplayed, cellIndex, cells } = displayResizer;

        const decorations = cells.map((cell) => {
          return Decoration.node(cell.from, cell.to, {
            class: "display-resizer",
          });
        });

        return {
          ...value,
          cellIndex,
          isResizerDisplayed,
          resizerDecorationSet: DecorationSet.create(newState.doc, decorations),
        };
      }

      // if resizing, then resizerDecorationSet MUST be maintained!
      if (resizeData) return resizeData;

      return value;
    },
  },

  props: {
    decorations(state) {
      return this.getState(state).resizerDecorationSet;
    },

    // idea: can dispatch tr to set meta or alter attributes
    handleDOMEvents: {
      mousedown(view, e) {
        const { dispatch } = view;
        const { tr } = view.state;

        const resizer = e.target.closest(".col-resizer");
        if (!resizer) return false;
        const table = resizer.closest("table");
        if (!table) return false;

        // obtain the cellIndex
        const { cellIndex } = ColumnResizingKey.getState(view.state);

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

        const move = (e) => {
          const { dispatch } = view;
          const { tr } = view.state;

          const { isDraggingResizer, cellIndex, startX, startWidth, tableID } =
            ColumnResizingKey.getState(view.state);

          if (!isDraggingResizer) return;

          const table = document.querySelector(`table[data-id="${tableID}"]`);
          if (!table) return;

          const trs = Array.from(table.querySelectorAll("tr"));
          const cells = trs.map((tr) => tr.children[cellIndex]);
          if (!cells) return;

          const delta = e.clientX - startX;

          const colwidth = clampMin(startWidth + delta, 150);

          // update tableCell node's colwidth attribute which is central
          cells.forEach((cell) => {
            const before = view.posAtDOM(cell) - 1;
            const node = view.state.doc.nodeAt(before);

            tr.setNodeMarkup(before, null, {
              ...node.attrs,
              colwidth,
            });
          });

          // update colgroup's col width and min-width
          const colgroup = table.querySelector("colgroup");
          const col = colgroup.children[cellIndex];
          col.style.width = `${colwidth}px`;
          col.style.minWidth = "150px";

          // update table width and min-width
          let tableWidth = 0;
          Array.from(colgroup.children).forEach((col) => {
            tableWidth += parseInt(col.style.width);
          });
          table.style.width = `${tableWidth}px`;
          table.style.minWidth = `${tableWidth}px`;

          dispatch(tr);
        };

        const finish = () => {
          // review: remove document's event listeners
          document.removeEventListener("mousemove", move);
          document.removeEventListener("mouseup", finish);

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
        };

        // review: add event listeners to document
        document.addEventListener("mousemove", move);
        document.addEventListener("mouseup", finish);

        // idea: this prevents selection from being made???
        e.preventDefault();
        // todo: stops event propagation to other plugin's mousedown
        return true;
      },

      mousemove(view, e) {
        const { dispatch } = view;
        const { tr } = view.state;

        const td = e.target.closest("td");
        if (!td) {
          dispatch(tr.setMeta("hide-resizer", true));
          return;
        }

        let GAP = 2;
        let CELLINDEX = null;

        const { left, right } = td.getBoundingClientRect();

        const leftGap = Math.abs(e.clientX - left);
        const rightGap = Math.abs(e.clientX - right);

        if (leftGap > GAP && rightGap > GAP) {
          dispatch(tr.setMeta("hide-resizer", true));
          return;
        }

        if (leftGap <= GAP) CELLINDEX = td.cellIndex - 1;
        if (rightGap <= GAP) CELLINDEX = td.cellIndex;

        if (CELLINDEX < 0) {
          dispatch(tr.setMeta("hide-resizer", true));
          return;
        }

        // get the table
        const table = td.closest("table");
        if (!table) {
          dispatch(tr.setMeta("hide-resizer", true));
          return;
        }

        // get the rows in that index
        const cells = Array.from(table.querySelectorAll("tr"))
          .map((tr) => {
            return tr.children[CELLINDEX];
          })
          .map((cell) => {
            const before = view.posAtDOM(cell) - 1;
            const node = view.state.doc.nodeAt(before);
            const after = before + node.nodeSize;

            return { from: before, to: after, node };
          });

        // render the resizer
        tr.setMeta("display-resizer", {
          cellIndex: CELLINDEX,
          cells,
        });

        dispatch(tr);
      },
    },
  },
});
