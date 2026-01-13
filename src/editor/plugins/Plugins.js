import { Extension } from "@tiptap/core";

import { SelectingCell } from "../nodes/Table/plugins/SelectingCell/SelectingCell";
import { TablePlugin } from "../nodes/Table/plugins/TablePlugin/TablePlugin";

export const Plugins = Extension.create({
  addProseMirrorPlugins() {
    return [SelectingCell, TablePlugin];
  },
});
