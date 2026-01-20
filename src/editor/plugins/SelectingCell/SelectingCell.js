import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import { CellSelection, columnResizingPluginKey } from "prosemirror-tables";

import { getDepthByContent } from "../../utils/getDepthByContent";
import { hideTableControls } from "../../utils/hideTableControls";
import { displayTextSelectedTableControls } from "../../utils/displayTextSelectedTableControls";
import { displayCellSelectedTableControls } from "../../utils/displayCellSelectedTableControls";

export const SelectingCellKey = new PluginKey("SelectingCellKey");

export const SelectingCell = new Plugin({
  key: SelectingCellKey,

  view() {
    let prevTableID = null;

    return {
      update(view) {
        const { selection } = view.state;
        const { $from } = selection;

        const resizeState = columnResizingPluginKey.getState(view.state);

        // if prevTableID exists and is dragging, hide the box and controls
        if (resizeState?.dragging && prevTableID) {
          // todo: set up a mutation observer here and resize the selection box

          return;
        }

        if (selection instanceof TextSelection) {
          const tableDepth = getDepthByContent($from, "table");
          const tableNode = $from.node(tableDepth);
          const cellDepth =
            getDepthByContent($from, "tableCell") ||
            getDepthByContent($from, "tableHeader");

          if (tableNode.type.name !== "table") {
            const currTableID = null;

            // prev = "a" curr = null
            // fix: I got an error here...
            if (prevTableID !== null) {
              hideTableControls(prevTableID); // destroy table A's overlay
              prevTableID = currTableID; // set prevTableID = null

              return;
            }

            // prev = null curr = null
            if (prevTableID === null) {
              prevTableID = currTableID; // set prevTableID = null

              return;
            }
          }

          const currTableID = tableNode.attrs.id;
          const cellBefore = $from.before(cellDepth);

          // prev = "a" curr = "b"
          if (prevTableID !== null && prevTableID !== currTableID) {
            hideTableControls(prevTableID); // destroy prev table
            prevTableID = currTableID; // set prevTableID to currTableID
            displayTextSelectedTableControls(view, currTableID, cellBefore); // render curr table overlay

            return;
          }

          // prev = null curr = "a"
          if (prevTableID === null && prevTableID !== currTableID) {
            prevTableID = currTableID; // set prevTableID = currID
            displayTextSelectedTableControls(view, currTableID, cellBefore); // render table A's overlay

            return;
          }

          // prev = "a" curr = "a"
          if (prevTableID === currTableID) {
            prevTableID = currTableID; // set prevTableID = currID
            displayTextSelectedTableControls(view, currTableID, cellBefore); // render table A's overlay

            return;
          }

          return;
        }

        // pretty much guaranteed that a table will exist
        if (selection instanceof CellSelection) {
          const tableDepth = getDepthByContent($from, "table");
          const tableNode = $from.node(tableDepth);

          if (tableNode.type.name !== "table") return;

          // this cannot be null
          const currTableID = tableNode.attrs.id;

          // prev = "a" curr = "b"
          if (prevTableID !== null && prevTableID !== currTableID) {
            hideTableControls(prevTableID); // destroy prev table
            prevTableID = currTableID; // set prevTableID to currTableID
            displayCellSelectedTableControls(view, currTableID); // render curr table overlay

            return;
          }

          // prev = null curr = "a"
          if (prevTableID === null && prevTableID !== currTableID) {
            prevTableID = currTableID; // set prevTableID = currID
            displayCellSelectedTableControls(view, currTableID); // render table A's overlay

            return;
          }

          // prev = "a" curr = "a"
          if (prevTableID === currTableID) {
            prevTableID = currTableID; // set prevTableID = currID
            displayCellSelectedTableControls(view, currTableID); // render table A's overlay

            return;
          }
        }
        //
      },
    };
  },
});
