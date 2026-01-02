import { Extension } from "@tiptap/core";

import { CellSelecting } from "../nodes/Table/CellSelecting";

export const Plugins = Extension.create({
  addProseMirrorPlugins() {
    return [];
  },
});
