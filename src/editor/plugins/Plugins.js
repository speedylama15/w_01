import { Extension } from "@tiptap/core";

import { BlockEvents } from "./BlockEvents";
import { MouseDown } from "./MouseDown";
import { SelectTableCell } from "./SelectTableCell";
import { BlockHandle_Plugin } from "./BlockHandle_Plugin";

export const Plugins = Extension.create({
  addProseMirrorPlugins() {
    return [BlockEvents, MouseDown, SelectTableCell, BlockHandle_Plugin];
  },
});
