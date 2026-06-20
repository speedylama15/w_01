import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import { CellSelection } from "prosemirror-tables";
import { DecorationSet, Decoration } from "@tiptap/pm/view";

import { trackActivityKey } from "../trackActivity/trackActivity";

import { autoScroll, isInclusive, isPureLeftClick } from "../../../utils";
import {
  getNearestNode,
  getNodeByNodeType,
  getPosAtDOM,
  isCellNode,
} from "../../utils";

import { IDLE, DOWN, DRAG } from "../../../constants";

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

export const cellSelectingKey = new PluginKey("cellSelectingKey");

// todo: I removed tableItem therefore, it's not 3 not 4
const cellSelecting = new Plugin({
  key: cellSelectingKey,

  props: {
    // this is to set ALL the table's wrapper's overflow to hidden
    // and to manually implement the scrolling functionality
    attributes(state) {
      const { operation } = trackActivityKey.getState(state);

      if (operation === CELL_SELECTING) {
        return { class: "cell-selecting" };
      }
    },

    // set .active-table class to the table that needs its controls to be rendered
    // manual setting of .active-table by dispatching makes things cumbersome
    // just let decorations() detect it
    decorations(state) {
      const { selection } = state;

      if (selection instanceof TextSelection) {
        // fix: maybe I should just use getNodeByNodeType and look for "content"?
        const nearestResult = getNearestNode(selection.$anchor);
        if (!nearestResult) return DecorationSet.empty;

        if (isCellNode(nearestResult.node)) {
          const result = getNodeByNodeType(selection.$anchor, "block");
          if (!result) return DecorationSet.empty;

          const b = selection.$anchor.before(result.depth);
          const a = selection.$anchor.after(result.depth);

          const dec = Decoration.node(b, a, { class: "active-table" });
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

      autoScroll(clientX, anchorWrapper, anchorWrapperRect);

      const cell = document
        .elementFromPoint(clientX, clientY)
        ?.closest("td, th");

      const { operation } = trackActivityKey.getState(view.state);

      if (operation === null) {
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

        tr.setMeta(trackActivityKey, { operation: CELL_SELECTING });

        dispatch(tr);

        rafID = requestAnimationFrame(loop);

        return;
      }

      if (operation === "CELL_SELECTING") {
        if (cell && cell.closest(".block-table").dataset.id === anchorTableID) {
          const headPos = getPosAtDOM(view, cell);

          const sel = CellSelection.create(tr.doc, anchorPos, headPos);

          tr.setSelection(sel);

          dispatch(tr);
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

          dispatch(tr.setMeta(trackActivityKey, { operation: null }));
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
