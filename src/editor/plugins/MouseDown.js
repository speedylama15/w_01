import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import { DecorationSet, Decoration } from "@tiptap/pm/view";
import { CellSelection } from "@tiptap/pm/tables";

import { MultiBlockSelection } from "../selections/MultiBlockSelection";
import { getDepthByNodeType } from "../utils/depth/getDepthByNodeType";
import { getDepthByContentType } from "../utils/depth/getDepthByContentType";

// fix: e.ctrlKey || e.metaKey -> creates NodeSelection...
// fix: when I rapidly move the mouse, browser selection can be made ✅
// review: selection -> gives me the previous selection
// review: e -> gives me the most recent selection
// idea: maybe I should make use of states instead?

export const MouseDownKey = new PluginKey("MouseDownKey");

export const MouseDown = new Plugin({
  key: MouseDownKey,

  state: {
    init() {
      return {
        isCellSelecting: false,
        anchorTableID: false,
        anchorCellDOM: false,
        anchorCellBefore: false,
      };
    },

    apply(tr, value) {
      return value;
    },
  },

  props: {
    attributes(state) {
      if (state.selection instanceof MultiBlockSelection) {
        return { class: "has-multi-block-selection" };
      }
      return {};
    },

    decorations(state) {
      const { selection } = state;

      if (selection instanceof MultiBlockSelection) {
        const decos = selection.positions.map((pos) =>
          Decoration.node(pos.before, pos.after, {
            class: "multi-block-selection",
          }),
        );

        return DecorationSet.create(state.doc, decos);
      }

      return DecorationSet.empty;
    },
  },

  view(view) {
    let isMouseDown = false;

    let isCellSelecting = false;

    let anchorData = {
      anchorTableID: null,
      anchorCellDOM: null,
      anchorCellBefore: null,
    };

    const handleMouseDown = (e) => {
      // left button MUST be clicked
      if (e.button !== 0) return;
      // ctrl or metaKey should not be pressed
      if (e.ctrlKey || e.metaKey) return;

      const { tr, selection } = view.state;
      const { $from, from, to } = selection;
      const { dispatch } = view;

      isMouseDown = true;

      if (e.shiftKey) {
        // get the current block DOM
        const currBlockDOM = e.target.closest(".block");

        // ERROR handle
        if (!currBlockDOM) {
          // SHIFT and something else has been pressed
          // not a normal type of selection
          // do nothing and prevent default behavior
          e.preventDefault();
          return;
        }

        // get current node and pos
        const currPos = view.posAtDOM(currBlockDOM) - 1;
        const currBlock = view.state.doc.nodeAt(currPos);

        // ERROR handle
        if (currBlock.attrs.nodeType !== "block") {
          // something went completely wrong...
          e.preventDefault();
          return;
        }

        if (selection instanceof TextSelection) {
          if (from === to) {
            // single selection
            // get the block node and depth
            const result = getDepthByNodeType($from, "block");

            if (result === null) {
              e.preventDefault();
              return;
            }

            const prevPos = $from.before(result.depth);
            const prevBlock = result.node;

            const isSame = prevBlock.attrs.id === currBlock.attrs.id;

            // ✅
            if (!isSame) {
              e.preventDefault();

              const multiSelection = MultiBlockSelection.create(
                tr.doc,
                Math.min(prevPos, currPos),
                Math.max(
                  prevPos + prevBlock.nodeSize,
                  currPos + currBlock.nodeSize,
                ),
              );

              dispatch(tr.setSelection(multiSelection));

              window.getSelection()?.removeAllRanges();

              return;
            }

            if (isSame) {
              // ⚠️
              if (currBlock.type.name === "table") {
                e.preventDefault();

                const cellDOM = e.target.closest("td, th");
                const cellPos = view.posAtDOM(cellDOM) - 1;
                const result =
                  getDepthByContentType($from, "tableCell") ||
                  getDepthByContentType($from, "tableHeader");

                const cellSelection = CellSelection.create(
                  tr.doc,
                  $from.before(result.depth),
                  cellPos,
                );

                dispatch(tr.setSelection(cellSelection));

                window.getSelection().removeAllRanges();

                return;
              }

              // ✅
              if (currBlock.type.name !== "table") {
                return;
              }
            }
          }

          // ✅
          if (from !== to) {
            e.preventDefault();

            const multiSelection = MultiBlockSelection.create(
              tr.doc,
              Math.min(currPos, from, to),
              Math.max(currPos + currBlock.nodeSize, from, to),
            );

            dispatch(tr.setSelection(multiSelection));

            window.getSelection()?.removeAllRanges();

            return;
          }
        }

        // ✅
        if (selection instanceof MultiBlockSelection) {
          e.preventDefault();

          const from = selection.positions[0].before;
          const to = selection.positions.at(-1).after;

          const multiSelection = MultiBlockSelection.create(
            tr.doc,
            Math.min(currPos, from),
            Math.max(currPos + currBlock.nodeSize, to),
          );

          dispatch(tr.setSelection(multiSelection));

          window.getSelection()?.removeAllRanges();

          return;
        }

        if (selection instanceof CellSelection) {
          const prevTable = selection.$anchorCell.node(-1);

          const isSame = prevTable.attrs.id === currBlock.attrs.id;

          // ⚠️
          if (isSame) {
            e.preventDefault();

            const cellDOM = e.target.closest("td, th");
            const cellPos = view.posAtDOM(cellDOM) - 1;

            const cellSelection = CellSelection.create(
              tr.doc,
              selection.$anchorCell.pos,
              cellPos,
            );

            dispatch(tr.setSelection(cellSelection));

            window.getSelection().removeAllRanges();

            return;
          }

          // ⚠️
          if (!isSame) {
            e.preventDefault();

            const from = selection.$anchorCell.pos;
            const to = selection.$headCell.pos;

            const multiSelection = MultiBlockSelection.create(
              tr.doc,
              Math.min(currPos, from),
              Math.max(currPos + currBlock.nodeSize, to),
            );

            dispatch(tr.setSelection(multiSelection));

            window.getSelection()?.removeAllRanges();

            return;
          }
        }
      }

      if (!e.shiftKey) {
        // when td is pressed
        const cellDOM = e.target.closest("td, th");

        if (cellDOM) {
          const cellBefore = view.posAtDOM(cellDOM) - 1;

          const tableDOM = cellDOM.closest(".block-table");
          const tableID = tableDOM.getAttribute("data-id");

          anchorData.anchorTableID = tableID;
          anchorData.anchorCellDOM = cellDOM;
          anchorData.anchorCellBefore = cellBefore;

          return;
        }

        // when block handle is pressed
      }
    };

    // idea: this mouse move handles the cell selecting
    const handleMouseMove = (e) => {
      const { tr } = view.state;
      const { dispatch } = view;

      if (!isMouseDown) return;
      // anchor cell must exist for this to do anything
      if (!anchorData.anchorCellDOM) return;

      const cellDOM = e.target.closest("td, th");

      if (cellDOM) {
        // mouse is down
        // anchor cell exists
        // found the head cell
        const headCellTable = cellDOM.closest(".block-table");
        const headCellTableID = headCellTable.getAttribute("data-id");

        // check if anchor and head cells are from the same table
        if (anchorData.anchorTableID !== headCellTableID) return;

        // check if the anchor and head cells are the same
        if (anchorData.anchorCellDOM === cellDOM) return;

        isCellSelecting = true;

        const headCellBefore = view.posAtDOM(cellDOM) - 1;

        // set cell selection
        const cellSelection = CellSelection.create(
          tr.doc,
          anchorData.anchorCellBefore,
          headCellBefore,
        );

        dispatch(tr.setSelection(cellSelection));

        // remove browser selection
        window.getSelection().removeAllRanges();
      }
    };

    const handleMouseUp = () => {
      isMouseDown = false;

      isCellSelecting = false;

      anchorData = {
        anchorTableID: null,
        anchorCellDOM: null,
        anchorCellBefore: null,
      };
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return {
      destroy() {
        document.removeEventListener("mousedown", handleMouseDown);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      },
    };
  },
});
