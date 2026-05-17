import { Extension } from "@tiptap/core";

import BlockNativeEvents_Plugin from "./BlockNativeEvents/BlockNativeEvents_Plugin";
import BlockHandle_Plugin from "./BlockHandle/plugins/BlockHandle_Plugin";
import { Placeholder_Plugin } from "./Placeholder/Placeholder_Plugin";
import { TrailingNode_Plugin } from "./TrailingNode/TrailingNode_Plugin";
import { RenderSelection_Plugin } from "./RenderSelection/RenderSelection_Plugin";
import EditorMarqueeSelection_Plugin from "./EditorMarqueeSelection/plugins/EditorMarqueeSelection_Plugin";
import { FixTable_Plugin } from "./FixTable/FixTable_Plugin";
import SlashCommand_Plugin from "./SlashCommand/SlashCommand_Plugin";
import ToolbarMenu_Plugin from "./ToolbarMenu/ToolbarMenu_Plugin";
import CellSelecting_Plugin from "./CellSelecting/CellSelecting_Plugin";
import { tr_plugin } from "./transactions_FILE";
import TableResizing_Plugin from "./TableResizing/TableResizing_Plugin";
import TableReordering_Plugin from "./TableReordering/TableReordering_Plugin";

export const Plugins = Extension.create({
  addProseMirrorPlugins() {
    return [
      tr_plugin,
      FixTable_Plugin, // has appendTransaction, put it at the bottom
      TrailingNode_Plugin, // has appendTransaction, put it at the top
      BlockNativeEvents_Plugin,
      Placeholder_Plugin,
      BlockHandle_Plugin(this.editor),
      RenderSelection_Plugin,
      EditorMarqueeSelection_Plugin,
      SlashCommand_Plugin(this.editor),
      ToolbarMenu_Plugin(this.editor),
      CellSelecting_Plugin,
      TableResizing_Plugin,
      TableReordering_Plugin,
    ];
  },
});
