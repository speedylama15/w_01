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
        return { mouseState: IDLE, operation: null };
      },

      apply(tr, value) {
        // IDLE, DOWN
        const mouseState = tr.getMeta("trackMouseState");
        const operation = tr.getMeta("trackOperation");

        const newValue = value;

        if (mouseState) newValue.mouseState = mouseState;
        if (operation) newValue.operation = operation;

        return newValue;
      },
    },

    filterTransaction(tr, state) {
      const pluginState = trackActivityKey.getState(state);

      // if the mouse is down and the transaction causes a change, block it
      // fix: this needs a better condition
      // if the mouse is down but there is an ongoing operation, then let the tr docChange happen
      // or allow doc changing tr with the appropriate meta
      if (pluginState.mouseState === DOWN && tr.docChanged) return false;

      return true;
    },

    view(view) {
      const down = () => {
        const { tr } = view.state;
        const { dispatch } = view;

        tr.setMeta("trackMouseState", DOWN);

        dispatch(tr);
      };

      const up = () => {
        const { tr } = view.state;
        const { dispatch } = view;

        tr.setMeta("trackMouseState", IDLE);

        dispatch(tr);
      };

      document.addEventListener("pointerdown", down);
      document.addEventListener("pointerup", up);

      return {
        destroy() {
          document.removeEventListener("pointerdown", down);
          document.removeEventListener("pointerup", up);
        },
      };
    },
  });
};

export default trackActivity;
