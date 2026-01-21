import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import { CellSelection } from "@tiptap/pm/tables";

export const CellInteractionsKey = new PluginKey("CellInteractionsKey");

// fix: e.ctrlKey || e.metaKey -> creates NodeSelection...
// fix: when I rapidly move the mouse, browser selection can be made ✅
// review: selection -> gives me the previous selection
// review: e -> gives me the most recent selection

export const CellInteractions = new Plugin({
  key: CellInteractionsKey,

  props: {
    handleDOMEvents: {
      //   dragstart: (view, e) => {
      //     console.log("drag start");
      //   },
      //   selectstart(view, e) {
      //     console.log("select start");
      //   },
      //   selectionchange(view, e) {
      //     console.log("selection change");
      //   },
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
      if (e.button != 0) return;
      if (e.ctrlKey || e.metaKey) return;

      isMouseDown = true;

      const cellDOM = e.target.closest("td, th");

      if (cellDOM) {
        const cellBefore = view.posAtDOM(cellDOM) - 1;

        const tableDOM = cellDOM.closest(".block-table");
        const tableID = tableDOM.getAttribute("data-id");

        anchorData.anchorTableID = tableID;
        anchorData.anchorCellDOM = cellDOM;
        anchorData.anchorCellBefore = cellBefore;
      }
    };

    // idea: this mouse move handles the cell selecting
    const handleMouseMove = (e) => {
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

        // todo: maybe I should make this a state?
        isCellSelecting = true;

        const { tr } = view.state;
        const { dispatch } = view;

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
