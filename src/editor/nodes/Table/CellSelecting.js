import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import { CellSelection } from "@tiptap/pm/tables";

const getOverlayDOM = (nodeID) => {
  const tableBlockDOM = document.querySelector(`div[data-id="${nodeID}"]`);

  return tableBlockDOM.querySelector(".table-overlay");
};

const hideTableOverlay = (nodeID) => {
  const overlay = getOverlayDOM(nodeID);

  overlay.style.display = "none";
};

const displaySingleCellTableOverlay = (view, nodeID, pos) => {
  const cellDOM = view.nodeDOM(pos);

  if (!cellDOM) return;

  const {
    offsetLeft: x,
    offsetTop: y,
    offsetWidth: width,
    offsetHeight: height,
  } = cellDOM;

  const overlay = getOverlayDOM(nodeID);

  overlay.style.display = "flex";
  overlay.style.top = y + 4 + "px";
  overlay.style.left = x + 4 + "px";
  overlay.style.width = width + "px";
  overlay.style.height = height + "px";
};

const displayMultiCellsTableOverlay = (view, nodeID) => {
  const { selection } = view.state;
  const { $anchorCell, $headCell } = selection;

  const anchorDOM = view.nodeDOM($anchorCell.pos);
  const headDOM = view.nodeDOM($headCell.pos);

  const overlay = getOverlayDOM(nodeID);

  const x = Math.min(anchorDOM.offsetLeft, headDOM.offsetLeft);
  const y = Math.min(anchorDOM.offsetTop, headDOM.offsetTop);
  const r = Math.max(
    anchorDOM.offsetLeft + anchorDOM.offsetWidth,
    headDOM.offsetLeft + headDOM.offsetWidth
  );
  const b = Math.max(
    anchorDOM.offsetTop + anchorDOM.offsetHeight,
    headDOM.offsetTop + headDOM.offsetHeight
  );
  const width = r - x;
  const height = b - y;

  overlay.style.display = "flex";
  overlay.style.top = y + 4 + "px";
  overlay.style.left = x + 4 + "px";
  overlay.style.width = width + "px";
  overlay.style.height = height + "px";
};

export const getDepthByContentType = ($from, contentType) => {
  let depth = $from.depth;

  for (let i = $from.depth; i >= 0; i--) {
    const node = $from.node(i);

    if (!node) {
      // fix
      console.log("something has gone wrong");

      break;
    }

    if (node.attrs.contentType === contentType || node.type.name === "doc") {
      depth = i;

      break;
    }
  }

  return depth;
};

export const getDepth = ($from, divType) => {
  let depth = $from.depth;

  for (let i = $from.depth; i >= 0; i--) {
    const node = $from.node(i);

    if (!node) {
      // fix
      console.log("something has gone wrong");

      break;
    }

    if (node.attrs.divType === divType || node.type.name === "doc") {
      depth = i;

      break;
    }
  }

  return depth;
};

export const CellSelectingKey = new PluginKey("CellSelectingKey");

export const CellSelecting = new Plugin({
  key: CellSelectingKey,

  props: {},

  view() {
    // need to know the tableID in which displayed the overlay
    // query for the blockTableDOM and hide the overlay
    let prevTableID = null;

    // todo: maybe I should use prevState instead of using prevTableID?
    // idea: I want the selection box to also resize when the columns are getting resized
    // idea: but update() does not get invoked when resizing is actively occurring
    // todo: so how do I manually trigger update() when mouse is resizing?
    // todo: maybe it can make use of state and simply inspect it? But again, manual trigger is needed
    return {
      update(view, prevState) {
        const { selection } = view.state;
        const { $from } = selection;

        // pretty much guaranteed that a table will exist
        if (selection instanceof CellSelection) {
          const depth = getDepthByContentType($from, "table");
          const node = $from.node(depth);

          if (node.type.name !== "table") return;

          // this cannot be null
          const currTableID = node.attrs.id;

          // prev = "a" curr = "b"
          if (prevTableID !== null && prevTableID !== currTableID) {
            // destroy prev table
            // set prevTableID to currTableID
            // render curr table overlay
            hideTableOverlay(prevTableID);
            prevTableID = currTableID;
            displayMultiCellsTableOverlay(view, currTableID);
            return;
          }

          // prev = null curr = "a"
          if (prevTableID === null && prevTableID !== currTableID) {
            // set prevTableID = currID
            // render table A's overlay
            prevTableID = currTableID;
            displayMultiCellsTableOverlay(view, currTableID);
            return;
          }

          // prev = "a" curr = "a"
          if (prevTableID === currTableID) {
            // set prevTableID = currID
            // render table A's overlay
            prevTableID = currTableID;
            displayMultiCellsTableOverlay(view, currTableID);
            return;
          }

          return;
        }

        if (selection instanceof TextSelection) {
          const tableDepth = getDepthByContentType($from, "table");
          const tableNode = $from.node(tableDepth);
          const cellDepth = getDepth($from, "tableCell");
          const cellNode = $from.node(cellDepth);

          // todo: tableHeader

          if (tableNode.type.name !== "table") {
            const currTableID = null;

            // prev = "a" curr = null
            // set prevTableID = null
            // destroy table A's overlay
            if (prevTableID !== null) {
              hideTableOverlay(prevTableID);
              prevTableID = currTableID;
              return;
            }

            // prev = null curr = null
            // set prevTableID = null
            if (prevTableID === null) {
              prevTableID = currTableID;
              return;
            }
          }

          const currTableID = tableNode.attrs.id;
          const cellBefore = $from.before(cellDepth);

          // prev = "a" curr = "b"
          if (prevTableID !== null && prevTableID !== currTableID) {
            // destroy prev table
            // set prevTableID to currTableID
            // render curr table overlay
            hideTableOverlay(prevTableID);
            prevTableID = currTableID;
            displaySingleCellTableOverlay(view, currTableID, cellBefore);
            return;
          }

          // prev = null curr = "a"
          if (prevTableID === null && prevTableID !== currTableID) {
            // set prevTableID = currID
            // render table A's overlay
            prevTableID = currTableID;
            displaySingleCellTableOverlay(view, currTableID, cellBefore);
            return;
          }

          // prev = "a" curr = "a"
          if (prevTableID === currTableID) {
            // set prevTableID = currID
            // render table A's overlay
            prevTableID = currTableID;
            displaySingleCellTableOverlay(view, currTableID, cellBefore);
            return;
          }

          return;
        }
      },
    };
  },
});
