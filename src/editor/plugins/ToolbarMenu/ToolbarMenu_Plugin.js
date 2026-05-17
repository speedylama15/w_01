import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import { ReactRenderer } from "@tiptap/react";
import debounce from "lodash.debounce";

import ToolbarMenu from "./ToolbarMenu.jsx";

// todo: I need to keep track of the mouse state, once the mouse is up, after a little while, render the menu (debounce)
// When the user scrolls, don't do anything
// todo: Menu needs to adjust coordinates when window is resized
// todo: Focus remains on the editor
// idea: maybe I shouldn't use React renderer?

export const ToolbarMenu_Key = new PluginKey("ToolbarMenu_Key");

const IDLE = "IDLE";
const DOWN = "DOWN";

const ToolbarMenu_Plugin = (editor) => {
  return new Plugin({
    key: ToolbarMenu_Key,

    view(view) {
      let toolbarMenu = null;

      const down = () => {
        // idea: maybe I should create this inside of Toolbar Menu?
        // so that this exists only when the menu has actually rendered?
        if (toolbarMenu) {
          toolbarMenu.destroy();
          toolbarMenu = null;
        }
      };

      const up = debounce(() => {
        const { selection } = view.state;
        const { anchor, head, from } = selection;

        if (
          anchor !== head &&
          selection instanceof TextSelection &&
          !toolbarMenu
        ) {
          const coords = view.coordsAtPos(from);
          const rect = view.dom.getBoundingClientRect();

          toolbarMenu = new ReactRenderer(ToolbarMenu, {
            editor,
            props: { coords, rect },
            as: "div",
            className: "toolbar-menu",
          });

          document.querySelector(".portal").appendChild(toolbarMenu.element);

          toolbarMenu.updateAttributes({
            style: `position: absolute; top: ${coords.bottom + window.scrollY}px; left: ${coords.left}px;`,
          });

          return;
        }

        if (toolbarMenu) {
          toolbarMenu.destroy();
          toolbarMenu = null;
        }
      }, 300);

      document.addEventListener("mousedown", down);
      document.addEventListener("mouseup", up);

      return {
        update(view) {
          const { selection } = view.state;
          const { anchor, head } = selection;

          if (
            anchor !== head &&
            selection instanceof TextSelection &&
            !toolbarMenu
          ) {
            return;
          }

          if (toolbarMenu) {
            toolbarMenu.destroy();
            toolbarMenu = null;
          }
        },

        destroy() {
          document.removeEventListener("mousedown", down);
          document.removeEventListener("mouseup", up);
        },
      };
    },
  });
};

export default ToolbarMenu_Plugin;
