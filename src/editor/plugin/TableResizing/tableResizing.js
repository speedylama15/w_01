import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

import { trackActivityKey } from "../trackActivity/trackActivity";

import { getPosAtDOM, getTableMap } from "../../utils";
import { clamp } from "../../../utils";

const tableResizingKey = new PluginKey("tableResizingKey");

const hideResizer = (view, down) => {
  const { isRendered, dom } = tableResizingKey.getState(view.state);

  if (isRendered) {
    const { tr } = view.state;
    const { dispatch } = view;

    dom.removeEventListener("pointerdown", down);

    tr.setMeta("table-resizing", {
      isRendered: false,
      set: DecorationSet.empty,
    });

    dispatch(tr);
  }
};

const tableResizing = new Plugin({
  key: tableResizingKey,

  state: {
    init() {
      return {
        isRendered: false,
        set: DecorationSet.empty,
        dom: null,
      };
    },

    apply(tr, value) {
      const meta = tr.getMeta("table-resizing");

      if (meta) {
        return {
          ...value,
          ...meta,
        };
      }

      return value;
    },
  },

  props: {
    decorations(state) {
      const { set } = tableResizingKey.getState(state);

      return set;
    },
  },

  view(view) {
    const down = (e) => {
      // capture phase pointerdown will trigger
      // but bubble phase pointerdowns will not!
      e.preventDefault();
      e.stopPropagation();

      // todo: set inert

      const { tr } = view.state;
      const { dispatch } = view;

      // todo: set operation to TABLE_RESIZING
      dispatch(tr.setMeta("trackOperation", { operation: "TABLE_RESIZING" }));

      const { dom } = tableResizingKey.getState(view.state);

      const cellIndex = parseInt(dom.getAttribute("data-cellIndex"));
      const cellWidth = parseInt(dom.getAttribute("data-cellWidth"));
      const resizerLeft = parseInt(dom.getAttribute("data-resizerLeft"));
      let newWidth = cellWidth;

      const startX = e.clientX;

      const move = (e) => {
        const currX = e.clientX;
        // ensure that there is no float
        const delta = Math.round(currX - startX);

        const left = clamp(
          resizerLeft + delta,
          resizerLeft - cellWidth + 150,
          resizerLeft - cellWidth + 700,
        );
        dom.style.left = left + "px";

        newWidth = clamp(cellWidth + delta, 150, 700);
      };

      const up = () => {
        const { tr } = view.state;
        const { dispatch } = view;

        if (newWidth !== cellWidth) {
          const tableDOM = dom.closest(".block-table");
          const before = getPosAtDOM(view, tableDOM);
          const node = view.state.doc.nodeAt(before);

          const { grid } = getTableMap(node, before);

          grid.forEach((row) => {
            const cell = row[cellIndex];

            tr.setNodeAttribute(cell.pos, "colwidth", newWidth);
          });
        }

        // todo: reset the operation
        tr.setMeta("trackOperation", { operation: null });
        tr.setMeta("table-resizing", {
          isRendered: false,
          set: DecorationSet.empty,
        });

        dispatch(tr);

        dom.removeEventListener("pointerdown", down);

        document.removeEventListener("pointermove", move);
        document.removeEventListener("pointerup", up);
      };

      document.addEventListener("pointermove", move);
      document.addEventListener("pointerup", up);
    };

    const move = (e) => {
      const { tr } = view.state;
      const { dispatch } = view;

      const { mousestate, operation } = trackActivityKey.getState(view.state);

      if (e.target.closest(".table-resizer")) return;
      if (operation === "TABLE_RESIZING") return;

      if (mousestate !== "IDLE" || operation) {
        hideResizer(view, down);
        return;
      }

      const cell = e.target.closest("td, th");
      if (!cell) {
        hideResizer(view, down);
        return;
      }

      const wrapper = cell.closest(".tableWrapper");
      const wrapperRect = wrapper.getBoundingClientRect();
      const scrollLeft = wrapper.scrollLeft;

      const cellRect = cell.getBoundingClientRect();
      const cellLeft = cellRect.left + scrollLeft;
      const cellRight = cellRect.right + scrollLeft;
      const cellIndex = cell.cellIndex;

      const mouseX = e.pageX + scrollLeft;

      const leftGap = Math.abs(cellLeft - mouseX);
      const rightGap = Math.abs(cellRight - mouseX);

      if (leftGap <= 5 && cellIndex !== 0) {
        const resizer = wrapper.querySelector(".table-resizer");

        const resizerLeft = cellLeft - wrapperRect.left;

        resizer.style.left = resizerLeft + "px";
        resizer.style.transform = "translateX(-50%)";

        // when rendered from the left, subtract by 1
        resizer.setAttribute("data-cellIndex", cellIndex - 1);
        resizer.setAttribute("data-resizerLeft", resizerLeft);

        const row = cell.parentNode;
        const targetCell = row.children[cellIndex - 1];
        const targetCellWidth = targetCell.getAttribute("colwidth");
        resizer.setAttribute("data-cellWidth", targetCellWidth);

        resizer.addEventListener("pointerdown", down); // idea

        const table = wrapper.closest(".block-table");
        const before = getPosAtDOM(view, table);
        const node = tr.doc.nodeAt(before);
        const after = before + node.nodeSize;

        const dec = Decoration.node(before, after, { class: "show-resizer" });
        const set = DecorationSet.create(tr.doc, [dec]);

        tr.setMeta("table-resizing", { isRendered: true, set, dom: resizer });

        dispatch(tr);

        return;
      } else if (rightGap <= 5) {
        const resizer = wrapper.querySelector(".table-resizer");

        const resizerLeft = cellRight - wrapperRect.left;

        resizer.style.left = resizerLeft + "px";
        if (cellIndex === cell.parentNode.children.length - 1) {
          resizer.style.transform = "translateX(-100%)";
        } else {
          resizer.style.transform = "translateX(-50%)";
        }

        resizer.setAttribute("data-cellIndex", cellIndex);
        resizer.setAttribute("data-resizerLeft", resizerLeft);
        resizer.setAttribute("data-cellWidth", cellRect.width);

        resizer.addEventListener("pointerdown", down);

        const table = wrapper.closest(".block-table");
        const before = getPosAtDOM(view, table);
        const node = tr.doc.nodeAt(before);
        const after = before + node.nodeSize;

        const dec = Decoration.node(before, after, { class: "show-resizer" });
        const set = DecorationSet.create(tr.doc, [dec]);

        tr.setMeta("table-resizing", { isRendered: true, set, dom: resizer });

        dispatch(tr);

        return;
      } else {
        hideResizer(view, down);
        return;
      }
    };

    document.addEventListener("pointermove", move);

    return {
      destroy() {
        document.removeEventListener("pointermove", move);
      },
    };
  },
});

export default tableResizing;
