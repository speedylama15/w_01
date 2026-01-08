import { Extension } from "@tiptap/core";

import { SelectingCell } from "../nodes/Table/plugins/SelectingCell/SelectingCell";
import { CellButton } from "../nodes/Table/plugins/CellButton/CellButton";
import { AddColumn } from "../nodes/Table/plugins/AddColumn/AddColumn";

export const Plugins = Extension.create({
  addProseMirrorPlugins() {
    return [SelectingCell, CellButton, AddColumn];
  },
});
