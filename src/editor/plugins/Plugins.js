import { Extension } from "@tiptap/core";

import BlockNativeEvents_Plugin from "./BlockNativeEvents/BlockNativeEvents_Plugin";
import BlockHandle_Plugin from "./BlockHandle/plugins/BlockHandle_Plugin";
import { Placeholder_Plugin } from "./Placeholder/Placeholder_Plugin";
import { TrailingNode_Plugin } from "./TrailingNode/TrailingNode_Plugin";
import { InputsPlugin } from "../keys/Inputs/Inputs";
import { RenderSelection_Plugin } from "./RenderSelection/RenderSelection_Plugin";

export const Plugins = Extension.create({
  addProseMirrorPlugins() {
    return [
      InputsPlugin,
      BlockNativeEvents_Plugin,
      Placeholder_Plugin,
      TrailingNode_Plugin,
      BlockHandle_Plugin,
      RenderSelection_Plugin,
    ];
  },
});
