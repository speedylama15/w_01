import { Extension } from "@tiptap/core";

import { BlockEvents_Plugin } from "./BlockEvents_Plugin";
import { MouseDown } from "./MouseDown";
import { RenderTableControls_Plugin } from "./RenderTableControls_Plugin";
import { BlockHandle_Plugin } from "./BlockHandle_Plugin";
import { TableReorder_Plugin } from "./TableReorder_Plugin";
import { TableCopyAndPaste } from "./TableCopyAndPaste";

import { Placeholder_Plugin } from "./Placeholder/Placeholder_Plugin";
import { createNodeMenuPlugin } from "./NodeMenu/NodeMenu_Plugin";
import { createCopyAndPastePlugin } from "./CopyAndPaste_Plugin";
import { createDragFileAndDropPlugin } from "./DragFileAndDrop_Plugin";
import { TrailingNode_Plugin } from "./TrailingNode/TrailingNode_Plugin";

export const Plugins = Extension.create({
  addProseMirrorPlugins() {
    return [
      BlockEvents_Plugin,
      // fix: name this Mousedown_Plugin
      // MouseDown,
      // RenderTableControls_Plugin,
      // BlockHandle_Plugin,
      // TableReorder_Plugin,
      // TableCopyAndPaste,

      Placeholder_Plugin,
      // idea: wow...
      createNodeMenuPlugin(this.editor),
      createCopyAndPastePlugin(),
      createDragFileAndDropPlugin(),
      TrailingNode_Plugin,
    ];
  },
});
