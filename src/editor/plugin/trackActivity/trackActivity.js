import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import MultiSelection from "../../selection/MultiSelection";

// todo: separately store all the plugin's keys for easier access
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
        const trackActivityState = tr.getMeta(trackActivityKey);

        if (trackActivityState) {
          return {
            ...value,
            ...trackActivityState,
          };
        }

        return value;
      },
    },

    filterTransaction(tr, state) {
      const trackActivityState = trackActivityKey.getState(state);

      // all doc changing operations trigger a change in the mouse up
      // so this condition is fine
      if (trackActivityState.mousestate === DOWN && tr.docChanged) {
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

        tr.setMeta(trackActivityKey, { mousestate: DOWN });

        dispatch(tr);
      };

      const up = () => {
        const { tr } = view.state;
        const { dispatch } = view;

        tr.setMeta(trackActivityKey, { mousestate: IDLE });

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
