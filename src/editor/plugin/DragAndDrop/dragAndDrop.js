import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { Plugin } from "@tiptap/pm/state";
import { Fragment } from "@tiptap/pm/model";
import Flatbush from "flatbush";
import MultiSelection from "../../selection/MultiSelection";

import { trackActivityKey } from "../trackActivity/trackActivity";

import dragAndDropStore from "./dragAndDropStore";

import { getBlocksData, verticalAutoScroll } from "../../utils";

// todo: need a util method for indentLevel (clamping from 0 to 12)

const DRAG_AND_DROP = "DRAG_AND_DROP";

const canBeTargetForDrop = (selection, resultIndex, targetIndex) => {
  let bool = true;

  for (let i = 0; i < selection.nodes.length; i++) {
    const node = selection.nodes[i];
    const { index } = node;

    if (i === 0) {
      if (targetIndex === index - 1) {
        bool = false;
        break;
      }
    }

    if (index === targetIndex) {
      bool = false;
      break;
    }
  }

  return bool;
};

const dragAndDrop = () => {
  return new Plugin({
    state: {
      init() {
        return DecorationSet.empty;
      },

      apply(tr, value) {
        const set = tr.getMeta(DRAG_AND_DROP);

        if (set) return set;

        return value;
      },
    },

    props: {
      decorations(state) {
        return this.getState(state);
      },
    },

    view(view) {
      const loop = () => {
        const { tr } = view.state;
        const { dispatch } = view;

        const { currentCoords, setRafID, setData, setTargetPos } =
          dragAndDropStore.getState();

        const { pageX, pageY, clientY } = currentCoords;

        verticalAutoScroll(clientY);

        if (!dragAndDropStore.getState().tree) setData(getBlocksData(tr.doc));

        const { tree, nodes, doms } = dragAndDropStore.getState();

        const result = tree.search(
          pageX - Infinity,
          pageY - 3,
          pageX + Infinity,
          pageY + 3,
        );

        if (!result.length) {
          tr.setMeta("DRAG_AND_DROP", DecorationSet.empty);

          setTargetPos(null);
          setRafID(requestAnimationFrame(loop)); // review: crucial

          dispatch(tr);

          return;
        }

        const resultIndex = result[0];
        const blockDOM = doms[resultIndex]; // top, right, bottom, left
        const height = blockDOM.bottom - blockDOM.top;

        let direction = null;
        let targetIndex = null;
        let targetClass = null;

        if (pageY < blockDOM.top + height / 2) {
          direction = resultIndex === 0 ? "top" : "bottom";
          targetIndex = resultIndex === 0 ? 0 : resultIndex - 1;
          targetClass = resultIndex === 0 ? "top-line" : "bottom-line"; // fix: change name
        } else {
          direction = "bottom";
          targetIndex = resultIndex;
          targetClass = "bottom-line";
        }

        if (!canBeTargetForDrop(tr.selection, resultIndex, targetIndex)) {
          tr.setMeta("DRAG_AND_DROP", DecorationSet.empty);
          setTargetPos(null); // review: important
        } else {
          const { before, after } = nodes[targetIndex];

          const dec = Decoration.node(before, after, {
            class: targetClass,
          });
          tr.setMeta("DRAG_AND_DROP", DecorationSet.create(tr.doc, [dec]));

          setTargetPos(direction === "top" ? before : after);
        }

        dispatch(tr);

        setRafID(requestAnimationFrame(loop)); // review: crucial
      };

      // fix: how do I handle when there is no selection or when the editor is blurred?
      const down = (e) => {
        const { mousestate, operation } = trackActivityKey.getState(view.state);
        if (operation !== "DRAG_AND_DROP" || mousestate !== "DOWN") return;

        e.preventDefault();
      };

      const move = (e) => {
        const { mousestate, operation } = trackActivityKey.getState(view.state);
        if (operation !== "DRAG_AND_DROP" || mousestate !== "DOWN") return;

        const { rafID, setCurrentCoords } = dragAndDropStore.getState();

        // each movement, update the coords
        setCurrentCoords({
          clientX: e.clientX,
          clientY: e.clientY,
          pageX: e.pageX,
          pageY: e.pageY,
        });

        if (rafID === null) requestAnimationFrame(loop);

        // BlockHandle -> handle click vs drag logic in its own pointermove
        // but once operation becomes drag and drop, this pointermove will take over
        // while its own pointermove will become obsolete
        // RadialMenu -> when the user selects drag and drop as its operation
        // this pointermove will take over
        // idea: make use of Zustand since loop needs access to updated values
      };

      const up = () => {
        const { operation } = trackActivityKey.getState(view.state);
        if (operation !== "DRAG_AND_DROP") return;

        const { rafID, targetPos, reset } = dragAndDropStore.getState();
        if (targetPos === null) return;

        const { tr, selection } = view.state;
        const { dispatch } = view;
        const { from, to } = selection;

        tr.insert(targetPos, Fragment.from(selection.blocks));
        const sel = MultiSelection.create(
          tr.doc,
          targetPos,
          targetPos + (to - from),
        );
        tr.setSelection(sel);
        tr.delete(tr.mapping.map(from), tr.mapping.map(to));
        tr.setMeta(DRAG_AND_DROP, DecorationSet.empty);
        tr.setMeta("trackOperation", { operation: null });

        dispatch(tr);

        cancelAnimationFrame(rafID);
        reset();
      };

      document.addEventListener("pointerdown", down);
      document.addEventListener("pointermove", move);
      document.addEventListener("pointerup", up);

      return {
        destroy() {
          document.removeEventListener("pointerdown", down);
          document.removeEventListener("pointermove", move);
          document.removeEventListener("pointerup", up);
        },
      };
    },
  });
};

export default dragAndDrop;
