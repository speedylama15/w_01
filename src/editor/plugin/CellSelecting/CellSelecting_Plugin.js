import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import { CellSelection } from "prosemirror-tables";
import { DecorationSet, Decoration } from "@tiptap/pm/view";

import { isInclusive, isPureLeftClick } from "../../../utils";
import { getNearestNode, isCellNode } from "../../utils";

// todo: left click, disallow scrolling, only 1 operation, chain the events
// todo: add an raf that allows scrolling to occur in the table
// fix: I can see why inactive table starts to scroll. It's because I allow the browser's native highlighting

const IDLE = "IDLE";
const DOWN = "DOWN";
const DRAG = "DRAG";
const MOVE = "MOVE"; // there is a difference between drag and move
const CELL_SELECTING = "CELL_SELECTING";

const setTableControls = (container, anchorCell, headCell) => {
  const box = container.querySelector(".selection-box");

  const containerRect = container.getBoundingClientRect();
  const anchorRect = anchorCell.getBoundingClientRect();
  const headRect = headCell.getBoundingClientRect();

  const top = Math.min(anchorRect.top, headRect.top);
  const bottom = Math.max(anchorRect.bottom, headRect.bottom);
  const left = Math.min(anchorRect.left, headRect.left);
  const right = Math.max(anchorRect.right, headRect.right);

  box.style.top = top - containerRect.top + 1 + "px";
  box.style.left = left - containerRect.left + container.scrollLeft + 1 + "px";
  box.style.width = right - left + "px";
  box.style.height = bottom - top + "px";

  const columnButton = container.querySelector(".column-button");
  const cellIndex = headCell.cellIndex;
  columnButton.setAttribute("data-index", cellIndex);
  columnButton.style.top = -1 + "px";
  columnButton.style.left =
    headRect.left -
    containerRect.left +
    container.scrollLeft +
    headRect.width / 2 +
    "px";

  const contentWrapper = container.parentNode;
  const rowButton = contentWrapper.querySelector(".row-button");
  const rowIndex = headCell.parentNode.rowIndex;
  rowButton.setAttribute("data-index", rowIndex);
  rowButton.style.top =
    headRect.top - containerRect.top + headRect.height / 2 + "px";
  rowButton.style.left = -1 + "px";
};

const mouseDownOnCell = (e, view, tr, start, end) => {
  const clickedPos = view.posAtCoords({ left: e.clientX, top: e.clientY });

  if (!clickedPos || !isInclusive(clickedPos.pos, start, end)) {
    const textSelection = TextSelection.create(tr.doc, start);

    tr.setSelection(textSelection);
  } else {
    const textSelection = TextSelection.create(tr.doc, clickedPos.pos);

    tr.setSelection(textSelection);
  }
};

const traverseToADOM = (e, view, nodeName) => {
  let foundDOM = false;
  let target = e.target;

  while (target !== view.dom && target?.parentNode) {
    if (target.nodeName === nodeName) {
      foundDOM = true;
      break;
    }

    target = target.parentNode;
  }

  if (!foundDOM) return null;

  return target;
};

const traverseToCellDOM = (e, view) => {
  let foundCell = false;
  let target = e.target;

  while (target !== view.dom && target?.parentNode) {
    if (target.nodeName === "TD" || target.nodeName === "TH") {
      foundCell = true;
      break;
    }

    target = target.parentNode;
  }

  if (!foundCell) return null;

  return target;
};

const traverseToContentDOM = (e, view) => {
  let foundContent = false;
  let target = e.target;

  while (target !== view.dom && target?.parentNode) {
    if (target.dataset.nodeType === "content") {
      foundContent = true;
      break;
    }

    target = target.parentNode;
  }

  if (!foundContent) return null;

  return target;
};

const traverseToBlockDOM = (e, view) => {
  let foundContent = false;
  let target = e.target;

  while (target !== view.dom && target?.parentNode) {
    if (target.classList.contains("block")) {
      foundContent = true;
      break;
    }

    target = target.parentNode;
  }

  if (!foundContent) return null;

  return target;
};

const traverseToNearestNodeDOM = (e, view) => {
  let foundNode = false;
  let target = e.target;

  while (target !== view.dom && target?.parentNode) {
    if (
      target.classList.contains("block") ||
      target.dataset.nodeType === "content"
    ) {
      foundNode = true;
      break;
    }

    target = target.parentNode;
  }

  if (!foundNode) return null;

  return target;
};

export const CellSelecting_Key = new PluginKey("CellSelecting_Key");

const CellSelecting_Plugin = new Plugin({
  key: CellSelecting_Key,

  state: {
    init() {
      return {
        isCellSelecting: false,
        tableID: null,
      };
    },

    apply(tr, value) {
      const cellSelecting = tr.getMeta(CELL_SELECTING);

      if (cellSelecting) return cellSelecting;

      return value;
    },
  },

  props: {
    attributes(state) {
      const pluginState = CellSelecting_Key.getState(state);
      const { isCellSelecting } = pluginState;

      if (isCellSelecting) return { class: "hide-native-selection" };
    },

    createSelectionBetween(view) {
      const pluginState = CellSelecting_Key.getState(view.state);
      const { isCellSelecting } = pluginState;

      if (isCellSelecting) return view.state.selection;

      return null;
    },

    decorations(state) {
      const { selection } = state;
      const { $from } = selection;

      // todo: should I limit this to single selection or also allow this in ranged selection
      // todo: ranged -> blue highlight ranges somewhere inside of a table all the way to another table <- 애매한데...
      if (selection instanceof TextSelection) {
        const result = getNearestNode($from);
        if (!result) return DecorationSet.empty;

        const { node, depth } = result;

        if (isCellNode(node)) {
          const tableBefore = $from.before(depth - 2);
          const tableAfter = $from.after(depth - 2);

          const dec = Decoration.node(tableBefore, tableAfter, {
            class: "active-table",
          });

          const set = DecorationSet.create(state.tr.doc, [dec]);

          return set;
        }
      }

      if (selection instanceof CellSelection) {
        const tableBefore = selection.$anchorCell.before(-1);
        const tableAfter = selection.$anchorCell.after(-1);

        const decs = [];

        const dec = Decoration.node(tableBefore, tableAfter, {
          class: "active-table",
        });

        decs.push(dec);

        selection.forEachCell((node, pos) => {
          const cellBefore = pos;
          const cellAfter = pos + node.nodeSize;

          const dec = Decoration.node(cellBefore, cellAfter, {
            class: "active-cell",
          });

          decs.push(dec);
        });

        return DecorationSet.create(state.tr.doc, decs);
      }
    },
  },

  view(view) {
    let anchorTableID = null;
    let anchorTableDOM = null;

    let anchorCellDOM = null;

    let anchorPos = null;

    const down = (e) => {
      const { tr } = view.state;
      const { dispatch } = view;

      // handle pure left click only
      // todo: therefore, because of this, I cannot handle the SHIFT logic here
      if (!isPureLeftClick(e)) return;

      const cellDOM = traverseToCellDOM(e, view);
      if (!cellDOM) return;

      anchorTableDOM = cellDOM.closest(".block-table");
      anchorTableID = anchorTableDOM.dataset.id;

      anchorCellDOM = cellDOM;

      const nodeBefore = view.posAtDOM(cellDOM) - 1;
      const node = tr.doc.nodeAt(nodeBefore);
      const nodeAfter = nodeBefore + node.nodeSize;
      anchorPos = nodeBefore;

      mouseDownOnCell(e, view, tr, nodeBefore + 2, nodeAfter - 2);

      tr.setMeta(CELL_SELECTING, {
        isCellSelecting: false,
      });

      dispatch(tr);

      const move = (e) => {
        const { tr } = view.state;
        const { dispatch } = view;

        const cellDOM = traverseToCellDOM(e, view);
        if (!cellDOM) return;

        const headCellTableID = cellDOM.closest(".block-table").dataset.id;

        const pluginState = CellSelecting_Key.getState(view.state);
        const { isCellSelecting } = pluginState;

        // same cell but not cell selecting
        if (anchorCellDOM === cellDOM && !isCellSelecting) return;
        // found cell but at a different table
        if (anchorTableID !== headCellTableID) return;

        if (!isCellSelecting) {
          console.log("INIT SELECT!!!!!!!!!!"); // fix

          const headPos = view.posAtDOM(cellDOM) - 1;

          tr.setMeta(CELL_SELECTING, { isCellSelecting: true });
          tr.setSelection(CellSelection.create(tr.doc, anchorPos, headPos));

          dispatch(tr);

          return;
        }

        if (isCellSelecting) {
          // console.log("SELECTING!!!!!!!!!!"); // fix

          const headPos = view.posAtDOM(cellDOM) - 1;

          const sel = CellSelection.create(tr.doc, anchorPos, headPos);
          tr.setSelection(sel);

          dispatch(tr);

          return;
        }
      };

      const up = () => {
        const { tr } = view.state;
        const { dispatch } = view;

        const pluginState = CellSelecting_Key.getState(view.state);
        const { isCellSelecting } = pluginState;

        if (isCellSelecting) {
          tr.setMeta(CELL_SELECTING, { isCellSelecting: false });

          dispatch(tr);
        }

        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
      };

      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    };

    document.addEventListener("mousedown", down);

    return {
      update(view) {
        const { selection } = view.state;
        const { $from } = selection;

        if (selection instanceof TextSelection) {
          // fix: this is an issue, ranged selection could have 2 cells from different tables
          // imagine the end of a table to the start of another table
          // idea: Notion approach -> mouse needs to hover the entire table for ranged text selection to apply to the entire table (mouse drag selection)
          // idea: or when the selection was TextSelection and it meets a table cell -> change to Multi (SHIFT + Arrow && SHIFT + Click)
          // todo: but here I am assuming that I incorporated the above tactics
          // selection is single and stays in a single cell or ranged but is in a single cell

          const result = getNearestNode($from);
          if (!result) return;

          const { node, depth } = result;

          if (isCellNode(node)) {
            const cellBefore = $from.before(depth) + 1;
            const cellDOM = view.domAtPos(cellBefore)?.node;
            if (!cellDOM) return;

            const tableDOM = cellDOM.closest(".block-table");
            if (!tableDOM) return; // need this when the first node of the editor is a table
            const tableWrapper = tableDOM.querySelector(".tableWrapper");

            setTableControls(tableWrapper, cellDOM, cellDOM);
          }
        }

        if (selection instanceof CellSelection) {
          const { $anchorCell, $headCell } = selection;

          const anchorDOM = view.nodeDOM($anchorCell.pos);
          const headDOM = view.nodeDOM($headCell.pos);

          const tableWrapper = anchorDOM.closest(".tableWrapper");

          setTableControls(tableWrapper, anchorDOM, headDOM);
        }
      },

      destroy() {
        document.removeEventListener("mousedown", down);
      },
    };
  },
});

export default CellSelecting_Plugin;
