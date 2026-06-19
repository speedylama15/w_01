import { Plugin, TextSelection } from "@tiptap/pm/state";
import getNearestNode from "../utils/getNearestNode";
import isCellNode from "../utils/isCellNode";
import getPosAtDOM from "../utils/getPosAtDOM";
import { CellSelection } from "prosemirror-tables";

// idea: need to think about working with createSelectionBetween and manually setting selection with e.preventDefault

// pointer down inside of the editor
const handlePointerDown = new Plugin({
  props: {
    handleDOMEvents: {
      // review: returning true in pointerdown does nothing really
      pointerdown(view, e) {
        const { tr, selection } = view.state;
        const { dispatch } = view;
        const { $from } = selection;

        // 1. isLeftClick?
        // 2. With shift or without shift?
        // 3. What was clicked?

        const nodeDOM = e.target.closest("[data-content-type]");
        if (!nodeDOM) return;

        const isFocused = view.hasFocus();
        const nodeType = nodeDOM.dataset.contentType;
        // need an object of some sort that'll help me with identification

        // fix: just work on shift clicks
        if (!e.shiftKey) return;

        if (selection instanceof TextSelection) {
          const result = getNearestNode($from);
          if (!result) return;

          const { node, depth } = result;

          // working only with cell nodes here
          if (!isCellNode(node)) return;

          e.preventDefault();

          const anchorbefore = $from.before(depth);
          const headbefore = getPosAtDOM(view, nodeDOM);

          const sel = CellSelection.create(tr.doc, anchorbefore, headbefore);
          tr.setSelection(sel);
          dispatch(tr);
        }

        if (selection instanceof CellSelection) {
          e.preventDefault();

          const { $anchorCell } = selection;

          const headbefore = getPosAtDOM(view, nodeDOM);
          const sel = CellSelection.create(tr.doc, $anchorCell.pos, headbefore);
          tr.setSelection(sel);
          dispatch(tr);
        }
        // fix: just work on shift clicks
      },
    },
  },
});

export default handlePointerDown;
