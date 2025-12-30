import { Extension } from "@tiptap/core";

import { ColumnResizing } from "../nodes/Table/ColumnResizing";
import { CellSelecting } from "../nodes/Table/CellSelecting";

export const Plugins = Extension.create({
  addProseMirrorPlugins() {
    return [ColumnResizing, CellSelecting];
  },
});
