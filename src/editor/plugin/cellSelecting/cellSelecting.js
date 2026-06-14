// todo: handle SHIFT + Click on a cell separately -> handle it inside handleSHIFTClick
// todo: when a cell is selected and another cell has been pressed with SHIFT
// fix: scrolling was occurring because non-active table was getting selected via Chrome's native selection
// fix: I feel like I need to use trackActivity instead of isSelecting

import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import { CellSelection } from "prosemirror-tables";
import { DecorationSet, Decoration } from "@tiptap/pm/view";

import { isInclusive, isPureLeftClick } from "../../../utils";
import {
  getNearestNode,
  getNodeByNodeType,
  getPosAtDOM,
  isCellNode,
} from "../../utils";

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

const pointerdownOnCell = (e, view, tr, start, end) => {
  const clickedPos = view.posAtCoords({ left: e.clientX, top: e.clientY });

  if (!clickedPos || !isInclusive(clickedPos.pos, start, end)) {
    const textSelection = TextSelection.create(tr.doc, start);

    tr.setSelection(textSelection);
  } else {
    const textSelection = TextSelection.create(tr.doc, clickedPos.pos);

    tr.setSelection(textSelection);
  }
};

// todo: I need one for the window and one for a container
const horizontalAutoScroll = (mouseX, container, containerRect) => {
  const MIN_SPEED = 3;
  const MAX_SPEED = 70;
  const THRESHOLD = 30;
  const UPPER_THRESHOLD = containerRect.x + THRESHOLD;
  const LOWER_THRESHOLD = containerRect.x + containerRect.width - THRESHOLD;

  if (mouseX <= UPPER_THRESHOLD) {
    const gap = UPPER_THRESHOLD - mouseX;
    const t = gap / MAX_SPEED;
    const speed = Math.min(MIN_SPEED + t * (MAX_SPEED - MIN_SPEED), MAX_SPEED);

    container.scrollBy(-speed, 0);
  }

  if (mouseX >= LOWER_THRESHOLD) {
    const gap = mouseX - LOWER_THRESHOLD;
    const t = gap / MAX_SPEED;
    const speed = Math.min(MIN_SPEED + t * (MAX_SPEED - MIN_SPEED), MAX_SPEED);

    container.scrollBy(speed, 0);
  }
};

export const cellSelectingKey = new PluginKey("cellSelectingKey");

const cellSelecting = new Plugin({
  key: cellSelectingKey,

  state: {
    init() {
      return {
        isSelecting: false,
      };
    },

    apply(tr, value) {
      const pluginState = tr.getMeta(CELL_SELECTING);

      const newValue = value;

      if (pluginState) {
        return {
          ...newValue,
          ...pluginState,
        };
      }

      return value;
    },
  },

  props: {
    attributes(state) {
      const { isSelecting } = cellSelectingKey.getState(state);

      if (isSelecting) return { class: "cell-selecting" };
    },

    // fix: add this handleSelection plugin
    createSelectionBetween(view) {
      const { isSelecting } = cellSelectingKey.getState(view.state);

      if (isSelecting) return view.state.selection;

      return null;
    },

    decorations(state) {
      const { selection } = state;

      if (selection instanceof TextSelection) {
        // fix: maybe I should just use getNodeByNodeType and look for "content"?
        const result = getNearestNode(selection.$from);

        if (!result) return DecorationSet.empty;

        if (isCellNode(result.node)) {
          const result = getNodeByNodeType(selection.$from, "block");

          if (!result) return DecorationSet.empty;

          const before = selection.$from.before(result.depth);
          const after = selection.$from.after(result.depth);

          const dec = Decoration.node(before, after, { class: "active-table" });
          const set = DecorationSet.create(state.doc, [dec]);

          return set;
        }

        return DecorationSet.empty;
      }

      if (selection instanceof CellSelection) {
        const before = selection.$anchorCell.before(-1);
        const after = selection.$anchorCell.after(-1);

        const dec = Decoration.node(before, after, { class: "active-table" });
        const set = DecorationSet.create(state.doc, [dec]);

        return set;
      }
    },
  },

  view(view) {
    let rafID = null;
    let moveEvent = null;

    let anchorCell = null;
    let anchorTable = null;
    let anchorTableID = null;
    let anchorWrapper = null;
    let anchorWrapperRect = null;

    let anchorPos = null;

    const loop = () => {
      const { tr } = view.state;
      const { dispatch } = view;
      const { clientX, clientY } = moveEvent;

      horizontalAutoScroll(clientX, anchorWrapper, anchorWrapperRect);

      const cell = document
        .elementFromPoint(clientX, clientY)
        ?.closest("td, th");

      const { isSelecting } = cellSelectingKey.getState(view.state);

      if (!isSelecting) {
        if (cell === anchorCell) {
          rafID = requestAnimationFrame(loop);

          return;
        } else if (cell) {
          const tableID = cell.closest(".block-table").dataset.id;

          const headPos =
            anchorTableID === tableID ? getPosAtDOM(view, cell) : anchorPos;

          const sel = CellSelection.create(tr.doc, anchorPos, headPos);

          tr.setSelection(sel);
        } else if (!cell) {
          const sel = CellSelection.create(tr.doc, anchorPos, anchorPos);

          tr.setSelection(sel);
        }

        tr.setMeta(CELL_SELECTING, { isSelecting: true });

        dispatch(tr);

        rafID = requestAnimationFrame(loop);

        return;
      }

      if (isSelecting) {
        if (cell && cell.closest(".block-table").dataset.id === anchorTableID) {
          const headPos = getPosAtDOM(view, cell);

          // fix
          try {
            const sel = CellSelection.create(tr.doc, anchorPos, headPos);
            tr.setSelection(sel);
            dispatch(tr);
          } catch (error) {
            console.log("Error...in cell selecting", error);
            return;
          }
        }

        rafID = requestAnimationFrame(loop);

        return;
      }
    };

    const down = (e) => {
      const isPure = isPureLeftClick(e);
      if (!isPure) return;

      const { tr } = view.state;
      const { dispatch } = view;

      anchorCell = e.target.closest("td, th");
      if (!anchorCell) return;

      anchorTable = anchorCell.closest(".block-table");
      anchorTableID = anchorTable.dataset.id;
      anchorWrapper = anchorTable.querySelector(".tableWrapper");
      anchorWrapperRect = anchorWrapper.getBoundingClientRect();

      anchorPos = getPosAtDOM(view, anchorCell);
      const node = view.state.doc.nodeAt(anchorPos);
      const after = anchorPos + node.nodeSize;

      tr.setNodeAttribute(
        getPosAtDOM(view, anchorTable),
        "contenteditable",
        true,
      );
      pointerdownOnCell(e, view, tr, anchorPos + 2, after - 2);

      dispatch(tr);

      const move = (e) => {
        moveEvent = e;

        if (rafID === null) rafID = requestAnimationFrame(loop);
      };

      const up = () => {
        const { tr } = view.state;
        const { dispatch } = view;

        if (rafID) {
          cancelAnimationFrame(rafID);
          rafID = null;

          moveEvent = null;

          anchorCell = null;
          anchorTable = null;
          anchorTableID = null;
          anchorWrapper = null;
          anchorWrapperRect = null;

          anchorPos = null;

          tr.setMeta(CELL_SELECTING, { isSelecting: false });
          dispatch(tr);
        }

        document.removeEventListener("pointermove", move);
        document.removeEventListener("pointerup", up);
      };

      document.addEventListener("pointermove", move);
      document.addEventListener("pointerup", up);
    };

    document.addEventListener("pointerdown", down);

    return {
      update(view, prevState) {
        const { doc, selection } = view.state;

        // idea: if doc changed, check
        // idea: if selection changed, check
        if (!prevState.selection.eq(selection) || !prevState.doc.eq(doc)) {
          if (selection instanceof TextSelection) {
            const { $head } = selection;

            // review: content nodes are tr, td, and th. The rest are blocks
            // review: therefore I don't think I will encounter that posAtDOM issue
            const result = getNodeByNodeType($head, "content");
            if (!result) return;

            const { depth } = result;
            const before = $head.before(depth);
            const anchorDOM = view.domAtPos(before + 1);

            if (!anchorDOM?.node) return;

            const wrapper = anchorDOM.node.closest(".tableWrapper");

            setTableControls(wrapper, anchorDOM.node, anchorDOM.node);

            // fix
            console.log("SET CONTROL");
          }

          if (selection instanceof CellSelection) {
            const { $anchorCell, $headCell } = selection;

            // fix: ?
            const anchorDOM = view.nodeDOM($anchorCell.pos);
            const headDOM = view.nodeDOM($headCell.pos);

            const tableWrapper = anchorDOM.closest(".tableWrapper");

            setTableControls(tableWrapper, anchorDOM, headDOM);

            // fix
            console.log("SET CONTROL");
          }
        }
      },

      destroy() {
        document.addEventListener("pointerdown", down);
      },
    };
  },
});

export default cellSelecting;
