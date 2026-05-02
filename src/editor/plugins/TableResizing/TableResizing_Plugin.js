import { Plugin } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

import mainStore from "../../../../stores/mainStore";

const hideResizer = (tr, dispatch) => {
  const set = DecorationSet.create(tr.doc, []);

  dispatch(tr.setMeta("table-resizer", set));
};

const TableResizing_Plugin = new Plugin({
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
    const down = (e) => {
      const { tr } = view.state;
      const { dispatch } = view;

      const resizer = e.target.closest(".table-resizer");

      if (resizer) {
        e.preventDefault();

        // operation = "TABLE_RESIZE";
        // activeResizerDOM = resizer;

        // const block = resizer.closest(".block-table");

        // activeBlock = block;

        // tableBefore = view.posAtDOM(block) - 1;
        // tableNode = tr.doc.nodeAt(tableBefore);

        // startX = e.pageX;
      }
    };

    const move = (e) => {
      const { tr } = view.state;
      const { dispatch } = view;

      const { operation } = mainStore.getState();

      if (operation === null) {
        const resizer = e.target.closest(".table-resizer");
        if (resizer) return;

        // I need both the block and cell to exist
        const block = e.target.closest(".block-table");
        const cell = e.target.closest("th, td");
        if (!block || !cell) {
          hideResizer(tr, dispatch);

          return;
        }

        const mouseX = e.pageX;

        const { cellIndex } = cell;
        const cellRect = cell.getBoundingClientRect();
        const cellLeft = cellRect.left;
        const cellRight = cellRect.right;

        const leftGap = Math.abs(cellLeft - mouseX);
        const rightGap = Math.abs(cellRight - mouseX);

        if (leftGap <= 5 && cellIndex !== 0) {
          const before = view.posAtDOM(block) - 1;
          const node = tr.doc.nodeAt(before);

          const dec = Decoration.node(before, before + node.nodeSize, {
            class: "show-table-resizer",
          });
          const set = DecorationSet.create(tr.doc, [dec]);
          dispatch(tr.setMeta("table-resizer", set));

          const resizer = block.querySelector(".table-resizer");
          resizer.style.left = cell.offsetLeft + "px";
          resizer.style.transform = "translateX(-50%)";
          resizer.setAttribute("data-cellIndex", cellIndex - 1);
          resizer.setAttribute("data-left", cell.offsetLeft); // why?

          return;
        }

        if (rightGap <= 5) {
          const before = view.posAtDOM(block) - 1;
          const node = tr.doc.nodeAt(before);

          const dec = Decoration.node(before, before + node.nodeSize, {
            class: "show-table-resizer",
          });

          const set = DecorationSet.create(tr.doc, [dec]);

          dispatch(tr.setMeta("table-resizer", set));

          const resizer = block.querySelector(".table-resizer");
          resizer.style.left = cell.offsetLeft + cell.offsetWidth + "px";
          resizer.setAttribute("data-cellIndex", cellIndex);
          resizer.setAttribute("data-left", cell.offsetRight);

          if (cellIndex === cell.parentNode.children.length - 1) {
            resizer.style.transform = "translateX(-7px)";
          } else {
            resizer.style.transform = "translateX(-50%)";
          }

          return;
        }

        hideResizer(tr, dispatch);

        return;
      }

      // if (operation === "TABLE_RESIZE" && activeResizerDOM) {
      //   const cellIndex = parseInt(
      //     activeResizerDOM.getAttribute("data-cellIndex"),
      //   );
      //   const resizerLeft = parseInt(
      //     activeResizerDOM.getAttribute("data-left"),
      //   );

      //   const firstRow = tableNode.firstChild;
      //   const cell = firstRow.children[cellIndex];
      //   const initWidth = cell.attrs.colwidth;

      //   const delta = e.pageX - startX;

      //   newWidth = Math.max(initWidth + delta, 150);

      //   activeResizerDOM.style.left =
      //     Math.max(resizerLeft - initWidth + 150, resizerLeft + delta) + "px";
      // }
    };

    const up = () => {
      const { tr } = view.state;
      const { dispatch } = view;

      if (operation === "TABLE_RESIZE") {
        const tableMap = getTableMap(tableNode, tableBefore);

        const cellIndex = parseInt(
          activeResizerDOM.getAttribute("data-cellIndex"),
        );

        tableMap.grid.forEach((row) => {
          const cell = row[cellIndex];

          tr.setNodeAttribute(cell.pos, "colwidth", newWidth);
        });

        hideResizer(tr, dispatch);

        operation = null;
        activeResizerDOM = null;
        startX = null;
        tableNode = null;
        tableBefore = null;
      }
    };

    document.addEventListener("mousedown", down);
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);

    return {
      destroy() {
        document.removeEventListener("mousedown", down);
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
      },
    };
  },
});

export default TableResizing_Plugin;
