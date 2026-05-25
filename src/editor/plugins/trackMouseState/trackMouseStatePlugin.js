import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import { MultiBlockSelection } from "../../selections/MultiBlockSelection";

export const TrackMouseState_Key = new PluginKey("TrackMouseState_Key");

const IDLE = "IDLE";
const DOWN = "DOWN";

const trackMouseStatePlugin = () => {
  return new Plugin({
    key: TrackMouseState_Key,

    state: {
      init() {
        return { mouseState: IDLE };
      },

      apply(tr, value) {
        const mouseState = tr.getMeta("trackMouseState");

        if (mouseState) return mouseState;

        return value;
      },
    },

    filterTransaction(tr, state) {
      const pluginState = TrackMouseState_Key.getState(state);

      // if the mouse is down and the transaction causes a change, block it
      if (pluginState.mouseState === DOWN && tr.docChanged) return false;

      return true;
    },

    props: {
      handleDOMEvents: {
        mousedown(view) {
          const { tr } = view.state;
          const { dispatch } = view;

          tr.setMeta("trackMouseState", { mouseState: DOWN });

          dispatch(tr);
        },

        mouseup(view) {
          const { tr } = view.state;
          const { dispatch } = view;

          tr.setMeta("trackMouseState", { mouseState: DOWN });

          dispatch(tr);
        },
      },
    },
  });
};

export default trackMouseStatePlugin;
