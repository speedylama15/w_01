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
  TableReordering_Plugin,
} from "../features";

import DragAndDropFiles_Plugin from "./DragAndDropFiles/DragAndDropFiles_Plugin";

import CellSelecting_Plugin from "../nodes/Table/plugins/CellSelecting_Plugin";
import TableResizing_Plugin from "../nodes/Table/plugins/TableResizing_Plugin";
import Character from "../shortcuts/Character";
import Arrows from "../shortcuts/Arrows";

export const Plugins = Extension.create({
  addProseMirrorPlugins() {
    return [
      PreventNativeDrag_Plugin,
      Placeholder_Plugin,
      TrailingNode_Plugin,

      RenderSelection_Plugin, // idea: maybe I should use ::after on the node to prevent text selection?

      Character,
      DragAndDropFiles_Plugin,

      // CopyAndPaste_Plugin,
      // BlockHandle_Plugin,
      // DragAndDrop_Plugin(this.editor),
      // EditorBoxSelect_Plugin(this.editor),

      // SlashCommand_Plugin(this.editor),

      // CellSelecting_Plugin,
      // TableResizing_Plugin,
      // TableReordering_Plugin,
    ];
  },
});
