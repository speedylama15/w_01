import { Extension } from "@tiptap/core";

import { Placeholder_Plugin } from "./Placeholder/Placeholder_Plugin";
import { TrailingNode_Plugin } from "./TrailingNode/TrailingNode_Plugin";
import { RenderSelection_Plugin } from "./RenderSelection/RenderSelection_Plugin";

import {
  BlockHandle_Plugin,
  CopyAndPaste_Plugin,
  DragAndDrop_Plugin,
  EditorBoxSelect_Plugin,
  SlashCommand_Plugin,
  TableResize_Plugin,
  PreventNativeDrag_Plugin,
  CellSelecting_Plugin,
} from "../features";

export const Plugins = Extension.create({
  addProseMirrorPlugins() {
    return [
      PreventNativeDrag_Plugin,
      Placeholder_Plugin,
      TrailingNode_Plugin,
      // CopyAndPaste_Plugin,
      // BlockHandle_Plugin,
      // DragAndDrop_Plugin(this.editor),
      // EditorBoxSelect_Plugin(this.editor),
      RenderSelection_Plugin,
      // SlashCommand_Plugin(this.editor),
      // TableResize_Plugin,
      CellSelecting_Plugin,
    ];
  },
});
