import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import { CellSelection } from "prosemirror-tables";
import { DecorationSet, Decoration } from "@tiptap/pm/view";

import { mainStore } from "../../../stores";

import { isInclusive, isLeftClick } from "../../../utils";
import { getNearestNode, getNodeByContentType, isCellNode } from "../../utils";

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

const mousedownOnCell = (e, view, tr, dispatch, start, end) => {
  const clickedPos = view.posAtCoords({ left: e.clientX, top: e.clientY });

  if (!clickedPos || !isInclusive(clickedPos.pos, start, end)) {
    const textSelection = TextSelection.create(tr.doc, start);

    tr.setSelection(textSelection);

    dispatch(tr);
  } else {
    const textSelection = TextSelection.create(tr.doc, clickedPos.pos);

    tr.setSelection(textSelection);

    dispatch(tr);
  }
};

const CellSelecting_Key = new PluginKey("CellSelecting_Key");

const CellSelecting_Plugin = new Plugin({
  key: CellSelecting_Key,

  state: {
    init() {
      return {
        isCellSelecting: false,
        tableID: null,
        anchorPos: null,
      };
    },

    apply(tr, value) {
      const cellSelecting = tr.getMeta(CELL_SELECTING);

      if (cellSelecting) return cellSelecting;

      return value;
    },
  },

  props: {
    createSelectionBetween(view) {
      const cellSelecting = CellSelecting_Key.getState(view.state);

      if (
        cellSelecting?.isCellSelecting &&
        view.state.selection instanceof CellSelection
      ) {
        // disable this and performance drops
        return view.state.selection;
      }

      return null;
    },

    decorations(state) {
      const { selection } = state;
      const { $anchor } = selection;

      if (selection instanceof TextSelection) {
        // get the table
        const result = getNodeByContentType($anchor, "table");
        if (!result) return DecorationSet.empty;

        const { node, depth } = result;

        const before = $anchor.before(depth);
        const after = before + node.nodeSize;

        const dec = Decoration.node(before, after, { class: "active-table" });

        return DecorationSet.create(state.tr.doc, [dec]);
      }

      if (selection instanceof CellSelection) {
        const before = selection.$anchorCell.before(-1);
        const after = selection.$anchorCell.after(-1);

        const dec = Decoration.node(before, after, { class: "active-table" });

        return DecorationSet.create(state.tr.doc, [dec]);
      }
    },
  },

  view(view) {
    const down = (e) => {
      const { tr } = view.state;
      const { dispatch } = view;

      // idea: essential
      if (!isLeftClick(e)) {
        e.preventDefault();

        return;
      }

      // get the cell DOM
      const cellDOM = e.target.closest("td, th");
      if (!cellDOM) return;

      const cellBefore = view.posAtDOM(cellDOM) - 1;
      const cellNode = view.state.doc.nodeAt(cellBefore);
      const cellAfter = cellBefore + cellNode.nodeSize;
      const cellStart = cellBefore + 2; // add and subtract by 2
      const cellEnd = cellAfter - 2;

      const tableDOM = cellDOM.closest(".block-table");
      if (!tableDOM) return;

      const tableID = tableDOM.getAttribute("data-id");

      mainStore.getState().setMouseState(DOWN);

      // when mouse is down on a cell, I MUST make a selection
      mousedownOnCell(e, view, tr, dispatch, cellStart, cellEnd);

      const handleMouseLeave = () => {
        const { mouseState, setMouseState, setOperation } =
          mainStore.getState();

        const { tr } = view.state;
        const { dispatch } = view;

        if (mouseState === DOWN) {
          setMouseState(DRAG);
          setOperation(CELL_SELECTING);

          tr.setMeta(CELL_SELECTING, {
            isCellSelecting: true,
            tableID,
            anchorPos: cellBefore,
          }).setSelection(CellSelection.create(tr.doc, cellBefore));

          dispatch(tr);
        }

        if (mouseState !== DOWN) {
          setMouseState(IDLE);
          setOperation(null);

          tr.setMeta(CELL_SELECTING, {
            isCellSelecting: false,
            tableID: null,
            anchorPos: null,
          });

          dispatch(tr);
        }

        cellDOM.removeEventListener("mouseleave", handleMouseLeave);
      };

      cellDOM.addEventListener("mouseleave", handleMouseLeave);
    };

    const move = (e) => {
      const { tr } = view.state;
      const { dispatch } = view;

      const { operation } = mainStore.getState();

      if (operation === CELL_SELECTING) {
        const cell = e.target.closest("td, th");

        // I am looking for a viable cell. That is all I need to do
        if (!cell) return;

        const currTableDOM = cell.closest(".block-table");
        if (!currTableDOM) return;

        const { tableID, anchorPos } = CellSelecting_Key.getState(view.state);

        const currTableID = currTableDOM.getAttribute("data-id");
        if (tableID !== currTableID) return;

        const headBefore = view.posAtDOM(cell) - 1;

        // console.log("What is going on here?", cell); // fix

        tr.setSelection(CellSelection.create(tr.doc, anchorPos, headBefore));

        dispatch(tr);
      }
    };

    const up = () => {
      const { tr } = view.state;
      const { dispatch } = view;

      const { setMouseState, setOperation } = mainStore.getState();

      setMouseState(IDLE);
      setOperation(null);

      const pluginState = CellSelecting_Key.getState(view.state);

      if (pluginState.isCellSelecting) {
        tr.setMeta(CELL_SELECTING, {
          isCellSelecting: false,
          tableID: null,
          anchorPos: null,
        });

        dispatch(tr);
      }
    };

    document.addEventListener("mousedown", down);
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);

    return {
      update(view) {
        const { selection } = view.state;

        if (selection instanceof TextSelection) {
          const { $anchor } = selection;

          const result = getNearestNode($anchor);
          if (!result) return;

          const { node, depth } = result;

          if (isCellNode(node)) {
            const cellBefore = $anchor.before(depth);
            const cellDOM = view.domAtPos(cellBefore + 1);

            if (!cellDOM) return;

            const containerDOM = cellDOM.node.closest(".tableWrapper");

            // review: for some reason, the .block-table disappears in the init stage
            // review: therefore, I need this guard
            if (!containerDOM) return;

            setTableControls(containerDOM, cellDOM.node, cellDOM.node);
          }
        }

        if (selection instanceof CellSelection) {
          const anchorPos = selection.$anchorCell.pos + 1;
          const headPos = selection.$headCell.pos + 1;

          const anchorCellDOM = view.domAtPos(anchorPos);
          const headCellDOM = view.domAtPos(headPos);

          if (anchorCellDOM.node && headCellDOM.node) {
            const containerDOM = headCellDOM.node.closest(".tableWrapper");

            setTableControls(
              containerDOM,
              anchorCellDOM.node,
              headCellDOM.node,
            );
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
