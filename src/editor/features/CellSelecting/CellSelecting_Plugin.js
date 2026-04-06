import { Plugin, PluginKey } from "@tiptap/pm/state";
import { CellSelection } from "prosemirror-tables";
import { DecorationSet, Decoration } from "@tiptap/pm/view";
import { MultiBlockSelection } from "../../selections/MultiBlockSelection";

// todo
// [x] decoration
// [x] cell selecting via dragging
// [x] selection box
// [?] findNearestCell?
// [] cell selecting via down + SHIFT -> I think I should handle this inside of createSelectionBetween?
// I could use Zustand instead of Plugin's state, but we'll see

const isViableCell = (anchorCell, headCell) => {
  const anchorTable = anchorCell.closest(".block-table");
  const headTable = headCell.closest(".block-table");

  return (
    anchorTable?.getAttribute("data-id") === headTable?.getAttribute("data-id")
  );
};

const setSelectionBox = (anchorCell, headCell) => {
  const table = anchorCell.closest(".block-table");
  const box = table.querySelector(".selection-box");

  const top = Math.min(anchorCell.offsetTop, headCell.offsetTop);
  const bottom = Math.max(
    anchorCell.offsetTop + anchorCell.offsetHeight,
    headCell.offsetTop + headCell.offsetHeight,
  );
  const left = Math.min(anchorCell.offsetLeft, headCell.offsetLeft);
  const right = Math.max(
    anchorCell.offsetLeft + anchorCell.offsetWidth,
    headCell.offsetLeft + headCell.offsetWidth,
  );

  box.style.top = top + "px";
  box.style.left = left + "px";
  box.style.width = right - left + "px";
  box.style.height = bottom - top + "px";
};

const CellSelecting_Key = new PluginKey("CellSelecting_Key");

const CellSelecting_Plugin = new Plugin({
  key: CellSelecting_Key,

  state: {
    init() {
      return {
        isCellSelecting: false,
        anchorPos: null,
        headPos: null,
      };
    },

    apply(tr, value) {
      const cellSelecting = tr.getMeta("CELL_SELECTING");

      if (cellSelecting) return cellSelecting;

      return value;
    },
  },

  props: {
    attributes(state) {
      const cellSelecting = CellSelecting_Key.getState(state);

      if (cellSelecting && cellSelecting.isCellSelecting) {
        return { class: "cell-selecting" };
      }
    },

    createSelectionBetween(view) {
      const cellSelecting = CellSelecting_Key.getState(view.state);

      if (cellSelecting && cellSelecting.isCellSelecting) {
        const { anchorPos, headPos } = cellSelecting;

        if (anchorPos !== headPos) {
          const cellSelection = CellSelection.create(
            view.state.tr.doc,
            anchorPos,
            headPos,
          );

          return cellSelection;
        } else {
          const cellSelection = CellSelection.create(
            view.state.tr.doc,
            anchorPos,
          );

          return cellSelection;
        }
      }

      // allow the default behavior to occur
      return null;
    },

    decorations(state) {
      const { selection } = state;

      if (!(selection instanceof CellSelection)) return null;

      if (selection instanceof CellSelection) {
        const decorations = [];

        const tableBefore = selection.$anchorCell.before(-1);
        const tableAfter = selection.$anchorCell.after(-1);

        const tableDecoration = Decoration.node(tableBefore, tableAfter, {
          class: "show-table-controls",
        });

        decorations.push(tableDecoration);

        selection.forEachCell((node, pos) => {
          decorations.push(
            Decoration.node(pos, pos + node.nodeSize, {
              class: "selected-cell",
            }),
          );
        });

        return DecorationSet.create(state.doc, decorations);
      }
    },
  },

  view(view) {
    let mouseState = "IDLE";
    let operation = null;

    let anchorPos = null;
    let anchorCellDOM = null;

    let headPos = null;
    let headCellDOM = null;

    const down = (e) => {
      const cell = e.target.closest("td, th");

      if (!cell) return;

      const pos = view.posAtDOM(cell) - 1;

      mouseState = "DOWN";

      anchorPos = pos;
      anchorCellDOM = cell;

      headPos = pos;
      headCellDOM = cell;
    };

    const move = (e) => {
      const { tr, selection } = view.state;
      const { dispatch } = view;

      // if the mouse is not DOWN -> ignore
      if (mouseState !== "DOWN" && operation === null) {
        tr.setMeta("CELL_SELECTING", {
          isCellSelecting: false,
          anchorPos: null,
          headPos: null,
        });

        return;
      }

      const cell = e.target.closest("td, th");

      if (!cell) {
        tr.setMeta("CELL_SELECTING", {
          isCellSelecting: false,
          anchorPos: null,
          headPos: null,
        });

        return;
      }

      // cell exists
      // need to check if the cell is viable first
      const isViable = isViableCell(anchorCellDOM, cell);

      if (!isViable) {
        tr.setMeta("CELL_SELECTING", {
          isCellSelecting: false,
          anchorPos: null,
          headPos: null,
        });

        return;
      }

      // then I need to check if the it's the same cell
      const pos = view.posAtDOM(cell) - 1;

      // mouse is roaming around the same cell, just do nothing
      if (anchorPos === pos) {
        if (selection instanceof CellSelection) {
          tr.setMeta("CELL_SELECTING", {
            isCellSelecting: true,
            anchorPos,
            headPos: pos,
          });

          dispatch(tr);
        } else {
          tr.setMeta("CELL_SELECTING", {
            isCellSelecting: false,
            anchorPos: null,
            headPos: null,
          });

          dispatch(tr);
        }

        return;
      }

      if (anchorPos !== pos) {
        // cell exists
        // in the same table
        // different cell
        operation = "CELL_SELECTING";
        headPos = pos;
        headCellDOM = cell;

        tr.setMeta("CELL_SELECTING", {
          isCellSelecting: true,
          anchorPos,
          headPos,
        });

        dispatch(tr);

        return;
      }
    };

    const up = () => {
      const { tr } = view.state;
      const { dispatch } = view;

      mouseState = "IDLE";
      operation = null;

      anchorPos = null;
      anchorCellDOM = null;

      headPos = null;
      headCellDOM = null;

      tr.setMeta("CELL_SELECTING", {
        isCellSelecting: false,
        anchorPos,
        headPos,
      });

      dispatch(tr);
    };

    document.addEventListener("mousedown", down);
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);

    return {
      update(view) {
        const { selection } = view.state;

        if (selection instanceof CellSelection) {
          const anchorPos = selection.$anchorCell.pos + 1;
          const headPos = selection.$headCell.pos + 1;

          const anchorCellDOM = view.domAtPos(anchorPos);
          const headCellDOM = view.domAtPos(headPos);

          if (anchorCellDOM.node && headCellDOM.node) {
            setSelectionBox(anchorCellDOM.node, headCellDOM.node);
          }
        }
      },

      destroy() {
        document.removeEventListener("mousedown", down);
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
      },
    };
  },
});

export default CellSelecting_Plugin;
