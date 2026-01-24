import { Extension } from "@tiptap/core";

import { BlockEvents } from "./BlockEvents";
import { MouseDown } from "./MouseDown";
import { SelectTableCell } from "./SelectTableCell";

export const Plugins = Extension.create({
  addProseMirrorPlugins() {
    return [BlockEvents, MouseDown, SelectTableCell];
  },
});
