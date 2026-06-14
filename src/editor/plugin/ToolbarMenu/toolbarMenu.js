import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import { ReactRenderer } from "@tiptap/react";
import debounce from "lodash.debounce";

import ToolbarMenu from "./ToolbarMenu.jsx";

// todo: When the user scrolls, don't do anything
// todo: I need to handle resizing of the window
// todo: use react renderer because focus needs to remain on the editor
// todo: needs to react to the marks

// todo: need to check if the range has been deleted or the anchorPos has been deleted

export const toolbarMenuKey = new PluginKey("toolbarMenuKey");

const getStyle = (coords) => {
  const style = `
    position: absolute;
    top: ${coords.bottom + window.scrollY}px;
    left: ${coords.left}px;
  `;

  return style;
};

const IDLE = "IDLE";
const DOWN = "DOWN";

const toolbarMenu = (editor) => {
  return new Plugin({
    key: toolbarMenuKey,

    view(view) {
      let menu = null;

      // review: if the menu is rendered, hide it
      // if a button inside ToolbarMenu is clicked, it won't reach this pointerdown
      const down = () => {
        if (menu) {
          menu.destroy();
          menu = null;
        }
      };

      // review: up checks if the menu needs to be rendered when it is hidden
      const up = debounce(() => {
        const { selection } = view.state;
        const { anchor, head } = selection;

        if (anchor !== head && selection instanceof TextSelection && !menu) {
          const coords = view.coordsAtPos(head);

          menu = new ReactRenderer(ToolbarMenu, {
            editor,
            props: { editor }, // fix: does it need it?
            className: "toolbar-menu",
          });

          menu.updateAttributes({ style: getStyle(coords) });
          document.querySelector(".portal").appendChild(menu.element);

          return;
        }
      }, 300);

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

export default toolbarMenu;
