import { Extension } from "@tiptap/core";

import BlockNativeEvents_Plugin from "./BlockNativeEvents/BlockNativeEvents_Plugin";
import BlockHandle_Plugin from "./BlockHandle/plugins/BlockHandle_Plugin";
import { Placeholder_Plugin } from "./Placeholder/Placeholder_Plugin";
import { TrailingNode_Plugin } from "./TrailingNode/TrailingNode_Plugin";
import { RenderSelection_Plugin } from "./RenderSelection/RenderSelection_Plugin";
import EditorMarqueeSelection_Plugin from "./EditorMarqueeSelection/plugins/EditorMarqueeSelection_Plugin";
import { FixTable_Plugin } from "./FixTable/FixTable_Plugin";
import SlashCommand_Plugin from "./SlashCommand/SlashCommand_Plugin";

export const Plugins = Extension.create({
  addProseMirrorPlugins() {
    return [
      FixTable_Plugin, // has appendTransaction, put it at the bottom
      TrailingNode_Plugin, // has appendTransaction, put it at the top
      BlockNativeEvents_Plugin,
      Placeholder_Plugin,
      BlockHandle_Plugin,
      RenderSelection_Plugin,
      EditorMarqueeSelection_Plugin,
      SlashCommand_Plugin(this.editor),
    ];
  },
});
