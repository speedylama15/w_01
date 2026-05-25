import { Plugin, PluginKey } from "@tiptap/pm/state";

import radialMenuStore from "./radialMenuStore";

import { isRightClick } from "../../../utils";
import { mainStore } from "../../../stores";

const RadialMenu_Key = new PluginKey("RadialMenu_Key");

const RadialMenu_Plugin = () => {
  return new Plugin({
    key: RadialMenu_Key,

    view(view) {
      const handleMouseDown = (e) => {
        const { operation } = mainStore.getState();

        if (isRightClick(e)) {
          e.preventDefault();

          const { setIsRadialMenuOpen, setRadialMenuCoords } =
            radialMenuStore.getState();

          setIsRadialMenuOpen(true);
          setRadialMenuCoords({ x: e.pageX, y: e.pageY });

          return;
        }

        if (operation === "EDITOR_MARQUEE-SELECTION") {
          //
        }
      };

      const handleContextMenu = (e) => {
        e.preventDefault();
      };

      const handleMouseMove = () => {};

      const handleMouseUp = () => {};

      document.addEventListener("mousedown", handleMouseDown);
      document.addEventListener("contextmenu", handleContextMenu);
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return {
        destroy() {
          document.removeEventListener("mousedown", handleMouseDown);
          document.removeEventListener("contextmenu", handleContextMenu);
          document.removeEventListener("mousemove", handleMouseMove);
          document.removeEventListener("mouseup", handleMouseUp);
        },
      };
    },
  });
};

export default RadialMenu_Plugin;
