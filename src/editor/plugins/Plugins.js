import { Extension } from "@tiptap/core";

import { BlockEvents } from "./BlockEvents";
import { MouseDown } from "./MouseDown";
import { RenderTableControls_Plugin } from "./RenderTableControls_Plugin";
import { BlockHandle_Plugin } from "./BlockHandle_Plugin";
import { TableReorder_Plugin } from "./TableReorder_Plugin";
import { TableCopyAndPaste } from "./TableCopyAndPaste";

export const Plugins = Extension.create({
  addProseMirrorPlugins() {
    return [
      BlockEvents,
      MouseDown, // fix: name this Mousedown_Plugin
      RenderTableControls_Plugin, // fix: rename this to renderTableControls_Plugin
      BlockHandle_Plugin,
      TableReorder_Plugin,
      TableCopyAndPaste,
    ];
  },
});
