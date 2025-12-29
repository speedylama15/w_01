import { Extension } from "@tiptap/core";
import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { CellSelection } from "@tiptap/pm/tables";

import { getDepth } from "../../utils/getDepth";

import { ColumnResizing } from "./ColumnResizing";

// idea: perhaps I can export this?
const TableSelectionPluginKey = new PluginKey("TableSelectionPluginKey");

const TableSelectionPlugin = new Plugin({
  key: TableSelectionPluginKey,

  // for actual dispatch
  // tr.setNodeMarkup
  appendTransaction(transactions, oldState, newState) {},

  state: {
    init() {
      return {
        isDraggingResizer: false,
        selectionBoxSet: DecorationSet.empty,
        colResizerSet: DecorationSet.empty,
      };
    },

    // returning new state
    apply(tr, value, oldState, newState) {
      const selectSingleCell = tr.getMeta("select-single-cell");
      const selectOthers = tr.getMeta("select-others");

      const hideColResizer = tr.getMeta("hide-col-resizer");
      const displayColResizer = tr.getMeta("display-col-resizer");

      const dragColResizer = tr.getMeta("drag-col-resizer");

      if (dragColResizer) {
        return {
          isDraggingResizer: dragColResizer.isDrag,
          selectionBoxSet: DecorationSet.empty,
          colResizerSet: value.colResizerSet,
        };
      }

      if (value.isDraggingResizer) {
        return value;
      }

      // when hiding the resizer
      // maintain the selection box
      if (hideColResizer) {
        return {
          selectionBoxSet: value.selectionBoxSet,
          colResizerSet: DecorationSet.empty,
        };
      }

      // when displaying col resizer
      // main the selection box
      if (displayColResizer) {
        const decorations = [];

        displayColResizer.forEach(({ before, node }) => {
          const deco = Decoration.node(before, before + node.nodeSize, {
            "data-cell-hover-id": node.attrs.id,
          });

          decorations.push(deco);
        });

        return {
          selectionBoxSet: value.selectionBoxSet,
          colResizerSet: DecorationSet.create(newState.doc, decorations),
        };
      }

      if (selectSingleCell) {
        const { cellID, cellBefore, cellNode } = selectSingleCell;

        const deco = Decoration.node(
          cellBefore,
          cellBefore + cellNode.nodeSize,
          {
            "data-cell-id": cellID,
          }
        );

        return {
          selectionBoxSet: DecorationSet.create(newState.doc, [deco]),
          colResizerSet: DecorationSet.empty,
        };
      }

      if (selectOthers) {
        return {
          selectionBoxSet: DecorationSet.empty,
          colResizerSet: value.colResizerSet,
        };
      }

      return value;
    },
  },

  props: {
    decorations(state) {
      const { selectionBoxSet, colResizerSet } =
        TableSelectionPlugin.getState(state);

      const decorations = [...selectionBoxSet.find(), ...colResizerSet.find()];

      return DecorationSet.create(state.doc, decorations);
    },

    handleDOMEvents: {
      // todo: mousedown
      mousedown(view, e) {
        const { tr } = view.state;
        const { dispatch } = view;
        const { $from } = view.state.selection;

        const td = e.target.closest("td");
        const button = e.target.closest("button");
        const colResizer = e.target.closest(".col-resizer");

        if (colResizer) {
          // debug: I need to remove selection
          console.log("mouse down on col resizer!!!");

          dispatch(tr.setMeta("drag-col-resizer", { isDrag: true }));

          return;
        }

        // button of the menu has been clicked
        // selection has already been made
        // identify the cell/s
        // perform operation here
        if (
          button?.className === "table-x-button" ||
          button?.className === "table-y-button"
        ) {
          return true;
        }

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
      // todo: mousedown

      // todo: mousemove
      mousemove(view, e) {
        const GAP = 2;

        const { tr } = view.state;
        const { dispatch } = view;

        const td = e.target.closest("td");

        if (!td) {
          // review: hide resizer
          dispatch(tr.setMeta("hide-col-resizer", true));
          return;
        }

        const table = td.closest("table");

        const mouseX = e.clientX;
        const { left: cellLeft, right: cellRight } = td.getBoundingClientRect();
        const leftGap = Math.abs(mouseX - cellLeft);
        const rightGap = Math.abs(mouseX - cellRight);

        if (leftGap > GAP && rightGap > GAP) {
          // review: hide resizer
          dispatch(tr.setMeta("hide-col-resizer", true));
          return;
        }

        // figure out the cell index in which the resizer needs to show up
        const cellIndex = leftGap <= GAP ? td.cellIndex - 1 : td.cellIndex;

        if (cellIndex === -1) return;

        const cells = Array.from(table.querySelectorAll("tr"))
          .map((row) => row.cells[cellIndex])
          .map((cell) => {
            const pos = view.posAtDOM(cell);
            const before = pos - 1;
            const node = view.state.doc.nodeAt(before);

            return {
              pos,
              before,
              node,
            };
          });

        // review: display resizer
        tr.setMeta("display-col-resizer", cells);

        dispatch(tr);
      },
      // todo: mousemove

      // todo: mouseup
      mouseup(view, e) {
        const { tr } = view.state;
        const { dispatch } = view;

        tr.setMeta("drag-col-resizer", { isDrag: false });
        dispatch(tr);
        return;
      },
      // todo: mouseup

      mouseleave(view, e) {
        // fix: when mouseleaves while multi-selecting, end the drag operation
      },
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
    return [ColumnResizing];
  },
});
