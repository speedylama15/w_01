import { Plugin } from "@tiptap/pm/state";
import { DecorationSet, Decoration } from "@tiptap/pm/view";

import slashCommandStore from "./slashCommandStore";

import { getDepthByNodeType } from "../../utils/depth/getDepthByNodeType";

const EDITOR_SLASH_COMMAND = "EDITOR_SLASH_COMMAND";

const SlashCommand_Plugin = () => {
  return new Plugin({
    state: {
      init() {
        return DecorationSet.empty;
      },

      apply(tr, value) {
        const set = tr.getMeta(EDITOR_SLASH_COMMAND);

        if (set) return set;

        return value;
      },
    },

    props: {
      decorations(state) {
        return this.getState(state);
      },

      //   handleKeyDown(view, e) {
      //     const { selection, tr } = view.state;
      //     const { $from, from } = selection;
      //     const { dispatch } = view;

      //     const { setOperation } = slashCommandStore.getState();

      //     if (e.key === "/") {
      //       // fix: in some nodes, this command should NOT be invoked
      //       const { node } = getDepthByNodeType($from, "block");

      //       const textContent = node.textContent;
      //       const parentOffset = $from.parentOffset;
      //       const char = textContent[parentOffset - 1];

      //       if (char === " ") {
      //         setOperation(EDITOR_SLASH_COMMAND);

      //         const set = getSlashCommandSet(tr.doc, from, from + 1);

      //         tr.setMeta(EDITOR_SLASH_COMMAND, set);
      //         tr.insertText("/", from);

      //         dispatch(tr);

      //         view.dom.blur();

      //         return;
      //       }
      //     }
      //     //
      //   },
    },

    view(view) {
      const handleKeyDown = (e) => {
        // need to check if the editor is focused
        // need ReactRenderer

        const { selection, tr } = view.state;
        const { $from, from } = selection;
        const { dispatch } = view;

        const { setOperation, setCoords, setPos } =
          slashCommandStore.getState();

        if (e.key === "/") {
          // fix: in some nodes, this command should NOT be invoked
          const { node } = getDepthByNodeType($from, "block");

          const textContent = node.textContent;
          const parentOffset = $from.parentOffset;
          const char = textContent[parentOffset - 1];

          if (char === " ") {
            e.preventDefault();

            setOperation(EDITOR_SLASH_COMMAND);
            setCoords(view.coordsAtPos(from));
            setPos(from + 1);

            tr.insertText("/", from);
            dispatch(tr);

            view.dom.blur();

            return;
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);

      return {
        destroy() {
          document.removeEventListener("keydown", handleKeyDown);
        },
      };
    },
  });
};

export default SlashCommand_Plugin;
