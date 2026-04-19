import { Plugin } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

const hideResizer = (tr, dispatch) => {
  const set = DecorationSet.create(tr.doc, []);

  dispatch(tr.setMeta("table-resizer", set));
};

const getCellRect = (e, container, cell) => {
  const rect = container.getBoundingClientRect();

  const { offsetLeft, offsetWidth, offsetHeight } = cell;

  const cellLeft = rect.left + offsetLeft;
  const cellRight = rect.left + offsetLeft + offsetWidth;

  return {
    cellLeft,
    cellRight,
    cellWidth: offsetWidth,
    cellHeight: offsetHeight,
    offsetLeft,
    offsetRight: offsetLeft + offsetWidth,
  };
};

const getTableMap = (tableNode, tableBefore) => {
  const rows = [];
  const grid = [];

  let rowIndex = null;

  tableNode.descendants((node, pos, parent, index) => {
    const nodePos = tableBefore + pos + 1;

    const type = node.firstChild.type.name || "tableCell";

    if (node.type.name === "tableRow") {
      const row = {
        type,
        pos: nodePos,
        node,
      };

      rows.push(row);

      rowIndex = index;
    }

    if (node.type.name === "tableHeader" || node.type.name === "tableCell") {
      const cell = {
        type: node.type.name || "tableCell",
        pos: nodePos,
        node,
      };

      const row = grid[rowIndex];

      if (!row) {
        grid.push([cell]);
      } else {
        row.push(cell);
      }

      return false;
    }
  });

  return { rows, grid };
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
    let operation = null;
    let mouseState = "IDLE";

    let newWidth = null;
    let activeResizerDOM = null;
    let startX = null;
    let tableNode = null;
    let tableBefore = null;
    let activeBlock = null;

    const down = (e) => {
      const { tr } = view.state;
      const { dispatch } = view;

      const resizer = e.target.closest(".table-resizer");

      if (resizer) {
        e.preventDefault();

        operation = "TABLE_RESIZE";
        activeResizerDOM = resizer;

        const block = resizer.closest(".block-table");

        activeBlock = block;

        tableBefore = view.posAtDOM(block) - 1;
        tableNode = tr.doc.nodeAt(tableBefore);

        startX = e.pageX;
      }
    };

    const move = (e) => {
      const { tr } = view.state;
      const { dispatch } = view;

      // render resizer
      if (operation === null) {
        const resizer = e.target.closest(".table-resizer");
        if (resizer) return;

        const block = e.target.closest(".block-table");

        // mouse did not enter a table
        // hide the resizer widgets
        if (!block) {
          hideResizer(tr, dispatch);

          return;
        }

        // if cell does not exist
        // most likely the mouse is at the padding area
        const cell = e.target.closest("th, td");

        if (!cell) {
          hideResizer(tr, dispatch);

          return;
        }

        // idea: need to get the scrollLeft of the scrollable element, as of now, the block is what is scrollable
        const scrollLeft = block.scrollLeft;

        // idea: this mouse coord takes the scroll into account
        const mouseX = e.pageX + scrollLeft;

        const { cellIndex } = cell;
        const { cellLeft, cellRight, offsetLeft, offsetRight } = getCellRect(
          e,
          block,
          cell,
        );

        const leftGap = Math.abs(cellLeft - mouseX);
        const rightGap = Math.abs(cellRight - mouseX);

        const tableBefore = view.posAtDOM(block) - 1;
        const tableNode = tr.doc.nodeAt(tableBefore);

        if (leftGap <= 5 && cellIndex !== 0) {
          const dec = Decoration.node(
            tableBefore,
            tableBefore + tableNode.nodeSize,
            {
              class: "show-table-resizer",
            },
          );

          const set = DecorationSet.create(tr.doc, [dec]);
          dispatch(tr.setMeta("table-resizer", set));

          const resizer = block.querySelector(".table-resizer");
          resizer.style.left = offsetLeft + "px";
          resizer.style.transform = "translateX(-50%)";
          resizer.setAttribute("data-cellIndex", cellIndex - 1);
          resizer.setAttribute("data-left", offsetLeft);

          return;
        } else if (rightGap <= 5) {
          const dec = Decoration.node(
            tableBefore,
            tableBefore + tableNode.nodeSize,
            {
              class: "show-table-resizer",
            },
          );

          const set = DecorationSet.create(tr.doc, [dec]);

          dispatch(tr.setMeta("table-resizer", set));

          const resizer = block.querySelector(".table-resizer");
          resizer.style.left = offsetRight + "px";
          resizer.setAttribute("data-cellIndex", cellIndex);
          resizer.setAttribute("data-left", offsetRight);

          if (cellIndex === cell.parentNode.children.length - 1) {
            resizer.style.transform = "translateX(-100%)";
          } else {
            resizer.style.transform = "translateX(-50%)";
          }

          return;
        } else {
          hideResizer(tr, dispatch);

          return;
        }
      }

      if (operation === "TABLE_RESIZE" && activeResizerDOM) {
        const cellIndex = parseInt(
          activeResizerDOM.getAttribute("data-cellIndex"),
        );
        const resizerLeft = parseInt(
          activeResizerDOM.getAttribute("data-left"),
        );

        const firstRow = tableNode.firstChild;
        const cell = firstRow.children[cellIndex];
        const initWidth = cell.attrs.colwidth;

        const delta = e.pageX - startX;

        newWidth = Math.max(initWidth + delta, 150);

        activeResizerDOM.style.left =
          Math.max(resizerLeft - initWidth + 150, resizerLeft + delta) + "px";
      }
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
