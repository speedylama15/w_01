import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import { CellSelection } from "@tiptap/pm/tables";

import { getByContentType } from "../utils/depth/getByContentType";
import { getByNodeType } from "../utils/depth/getByNodeType";

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
      const { dispatch } = view;

      isMouseDown = true;

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

      if (e.shiftKey) {
        // e.preventDefault();
        const cellDOM = e.target.closest("td, th");

        if (cellDOM) {
          const cellBefore = view.posAtDOM(cellDOM) - 1;

          const tableDOM = cellDOM.closest(".block-table");
          const tableID = tableDOM.getAttribute("data-id");

          if (selection instanceof TextSelection) {
            // get the node in which has been selected
            const { $from } = selection;

            // get the table node
            const tableResult = getByNodeType($from, "block");
            if (tableResult === null) return;

            // check isSameTable
            const prevTableNode = $from.node(tableResult.depth);
            const prevTableID = prevTableNode.attrs.id;

            if (tableID !== prevTableID) return;

            // get the cell node
            const cellResult =
              getByContentType($from, "tableHeader") ||
              getByContentType($from, "tableCell");

            // get the before of the cell
            const prevCellBefore = $from.before(cellResult.depth);

            // create CellSelection
            const cellSelection = CellSelection.create(
              tr.doc,
              prevCellBefore,
              cellBefore
            );

            dispatch(tr.setSelection(cellSelection));

            e.preventDefault();

            return;
          }

          if (selection instanceof CellSelection) {
            // get the table
            const tableNode = selection.$anchorCell.node(-1);

            // check isSameTable
            if (tableID !== tableNode.attrs.id) return;

            // adjust CellSelection
            const cellSelection = CellSelection.create(
              tr.doc,
              selection.$anchorCell.pos,
              cellBefore
            );

            dispatch(tr.setSelection(cellSelection));

            e.preventDefault();
          }
        }
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
          headCellBefore
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

    view.dom.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return {
      destroy() {
        view.dom.removeEventListener("mousedown", handleMouseDown);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      },
    };
  },
});
