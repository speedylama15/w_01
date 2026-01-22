import { Extension } from "@tiptap/core";

import { DisableTripleClick } from "./DisableTripleClick";
import { SelectingCell } from "./Tables/SelectingCell/SelectingCell";
import { MouseDown } from "./MouseDown";

export const Plugins = Extension.create({
  addProseMirrorPlugins() {
    return [DisableTripleClick, SelectingCell, MouseDown];
  },
});
