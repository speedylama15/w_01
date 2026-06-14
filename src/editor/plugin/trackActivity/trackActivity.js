import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import MultiSelection from "../../selection/MultiSelection";

export const trackActivityKey = new PluginKey("trackActivityKey");

const IDLE = "IDLE";
const DOWN = "DOWN";

const trackActivity = () => {
  return new Plugin({
    key: trackActivityKey,

    state: {
      init() {
        return { mousestate: IDLE, operation: null };
      },

      apply(tr, value) {
        // IDLE, DOWN
        const mousestate = tr.getMeta("trackMousestate");
        const operation = tr.getMeta("trackOperation");

        const newValue = value;

        if (mousestate) newValue.mousestate = mousestate.mousestate;
        if (operation) newValue.operation = operation.operation;

        return newValue;
      },
    },

    filterTransaction(tr, state) {
      const pluginState = trackActivityKey.getState(state);

      // all doc changing operations trigger a change in the mouse up
      // so this condition is fine
      if (pluginState.mousestate === DOWN && tr.docChanged) {
        console.log("FILTERED"); // fix

        return false;
      }

      return true;
    },

    props: {
      attributes(state) {
        const { mousestate, operation } = trackActivityKey.getState(state);

        if (mousestate === "IDLE" && operation === "DRAG_AND_DROP") {
          return { class: "drag-and-drop-hand" };
        }

        if (mousestate === "DOWN" && operation === "DRAG_AND_DROP") {
          return { class: "drag-and-drop-grab" };
        }
      },
    },

    view(view) {
      const down = () => {
        const { tr } = view.state;
        const { dispatch } = view;

        console.log("TRACKACTIVITY_DOWN");

        tr.setMeta("trackMousestate", { mousestate: DOWN });

        dispatch(tr);
      };

      const up = () => {
        const { tr } = view.state;
        const { dispatch } = view;

        console.log("TRACKACTIVITY_UP");

        tr.setMeta("trackMousestate", { mousestate: IDLE });

        dispatch(tr);
      };

      window.addEventListener("pointerdown", down, { capture: true });
      window.addEventListener("pointerup", up, { capture: true });

      return {
        destroy() {
          window.removeEventListener("pointerdown", down, { capture: true });
          window.removeEventListener("pointerup", up, { capture: true });
        },
      };
    },
  });
};

export default trackActivity;
