import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

import { getTableMap } from "../../utils";

const hideResizer = (tr, dispatch) => {
  const set = DecorationSet.create(tr.doc, []);

  dispatch(tr.setMeta("table-resizer", set));
};

const TableResizing_Key = new PluginKey("TableResizing_Key");

const TableResizing_Plugin = new Plugin({
  key: TableResizing_Key,

  state: {
    init() {
      return DecorationSet.empty;
    },

    apply(tr, value) {
      const resizerSet = tr.getMeta("table-resizer");

      if (resizerSet) return resizerSet;

      return value;
    },
  },

  props: {
    decorations(state) {
      return this.getState(state);
    },
  },

  view(view) {
    let mouseState = "IDLE";
    let newWidth = null;

    const down = (e) => {
      const resizer = e.target.closest(".table-resizer");
      if (!resizer) return;

      const { tr } = view.state;

      e.preventDefault();

      mouseState = "DOWN";

      const tableDOM = resizer.closest(".block-table");

      const tableBefore = view.posAtDOM(tableDOM) - 1;
      const tableNode = tr.doc.nodeAt(tableBefore);
      const startX = e.pageX;

      const move = (e) => {
        const cellIndex = parseInt(resizer.getAttribute("data-cellIndex"));
        const resizerLeft = parseInt(resizer.getAttribute("data-left"));

        const firstRow = tableNode.firstChild;
        const targetCell = firstRow.children[cellIndex];

        const initWidth = targetCell.attrs.colwidth;
        const delta = e.pageX - startX;
        resizer.style.left =
          Math.max(resizerLeft - initWidth + 150, resizerLeft + delta) + "px";

        newWidth = Math.max(initWidth + delta, 150);
      };

      const up = () => {
        const { tr } = view.state;
        const { dispatch } = view;

        mouseState = "IDLE";

        const tableMap = getTableMap(tableNode, tableBefore);

        const cellIndex = parseInt(resizer.getAttribute("data-cellIndex"));

        tableMap.grid.forEach((row) => {
          const cell = row[cellIndex];

          tr.setNodeAttribute(cell.pos, "colwidth", newWidth);
        });

        hideResizer(tr, dispatch);

        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
      };

      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    };

    const move = (e) => {
      const { tr } = view.state;
      const { dispatch } = view;

      if (mouseState === "IDLE") {
        // review: resizer is rendered because condition was met
        // review: and now the mouse is placed over the resizer
        const resizer = e.target.closest(".table-resizer");
        if (resizer) return;

        const tableDOM = e.target.closest(".block-table");
        // review: need just this cell's rect, not the entire table's cells
        const cellDOM = e.target.closest("td, th");

        if (!tableDOM || !cellDOM) {
          // fix: if there is a decoration which enables the rendering of resizer, hide it
          // I wonder if there is a better way to handle this
          const pluginState = TableResizing_Key.getState(view.state);
          if (pluginState.local.length > 0 || pluginState.children.length > 0) {
            hideResizer(tr, dispatch);
          }

          return;
        }

        const tableWrapper = cellDOM.closest(".tableWrapper");
        const wrapperRect = tableWrapper.getBoundingClientRect();
        const scrollLeft = tableWrapper.scrollLeft;
        const mouseX = e.pageX + scrollLeft;

        const cellRect = cellDOM.getBoundingClientRect();
        const cellLeft = cellRect.left + scrollLeft;
        const cellRight = cellRect.right + scrollLeft;
        const cellIndex = cellDOM.cellIndex;

        const leftGap = Math.abs(cellLeft - mouseX);
        const rightGap = Math.abs(cellRight - mouseX);

        if (leftGap <= 5 && cellIndex !== 0) {
          const tableBefore = view.posAtDOM(tableDOM) - 1;
          const tableNode = tr.doc.nodeAt(tableBefore);

          const dec = Decoration.node(
            tableBefore,
            tableBefore + tableNode.nodeSize,
            {
              class: "show-table-resizer",
            },
          );
          const set = DecorationSet.create(tr.doc, [dec]);
          dispatch(tr.setMeta("table-resizer", set));

          const offset = cellLeft - wrapperRect.left;
          const resizer = tableDOM.querySelector(".table-resizer");
          resizer.style.left = offset + "px";
          resizer.style.transform = "translateX(-50%)";
          resizer.setAttribute("data-cellIndex", cellIndex - 1);
          resizer.setAttribute("data-left", offset);

          return;
        }

        if (rightGap <= 5) {
          const tableBefore = view.posAtDOM(tableDOM) - 1;
          const tableNode = tr.doc.nodeAt(tableBefore);

          const dec = Decoration.node(
            tableBefore,
            tableBefore + tableNode.nodeSize,
            {
              class: "show-table-resizer",
            },
          );
          const set = DecorationSet.create(tr.doc, [dec]);
          dispatch(tr.setMeta("table-resizer", set));

          const offset = cellRight - wrapperRect.left;
          const resizer = tableDOM.querySelector(".table-resizer");
          resizer.style.left = offset + "px";
          resizer.setAttribute("data-cellIndex", cellIndex);
          resizer.setAttribute("data-left", offset);

          if (cellIndex === cellDOM.parentNode.children.length - 1) {
            resizer.style.transform = "translateX(-100%)";
          } else {
            resizer.style.transform = "translateX(-50%)";
          }

          return;
        }

        // fix: if there is a decoration which enables the rendering of resizer, hide it
        // I wonder if there is a better way to handle this
        const pluginState = TableResizing_Key.getState(view.state);
        if (pluginState.local.length > 0 || pluginState.children.length > 0) {
          hideResizer(tr, dispatch);
        }
      }
    };

    document.addEventListener("mousedown", down);
    document.addEventListener("mousemove", move);

    return {
      destroy() {
        document.removeEventListener("mousedown", down);
        document.removeEventListener("mousemove", move);
      },
    };
  },
});

export default TableResizing_Plugin;
