import { Extension } from "@tiptap/core";

import { SelectingCell } from "../nodes/Table/plugins/SelectingCell/SelectingCell";
import { CellButton } from "../nodes/Table/plugins/CellButton/CellButton";

export const Plugins = Extension.create({
  addProseMirrorPlugins() {
    return [SelectingCell, CellButton];
  },
});
