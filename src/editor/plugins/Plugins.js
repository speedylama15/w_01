import { Extension } from "@tiptap/core";

import { SelectingCell } from "./SelectingCell/SelectingCell";
import { TablePlugin } from "./TablePlugin/TablePlugin";
import { BlockHandlePlugin } from "./BlockHandle/BlockHandlePlugin";
import { SelectionControl } from "./SelectionControlPlugin/SelectionControlPlugin";

export const Plugins = Extension.create({
  addProseMirrorPlugins() {
    return [SelectingCell, TablePlugin, BlockHandlePlugin, SelectionControl];
  },
});
