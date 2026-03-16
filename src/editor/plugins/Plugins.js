import { Extension } from "@tiptap/core";

import { Placeholder_Plugin } from "./Placeholder/Placeholder_Plugin";
import { TrailingNode_Plugin } from "./TrailingNode/TrailingNode_Plugin";
import { RenderSelection_Plugin } from "./RenderSelection/RenderSelection_Plugin";

import { BlockHandle_Plugin, EditorBoxSelect_Plugin } from "../features";

export const Plugins = Extension.create({
  addProseMirrorPlugins() {
    return [
      Placeholder_Plugin,
      TrailingNode_Plugin,
      BlockHandle_Plugin,
      EditorBoxSelect_Plugin(this.editor),
      RenderSelection_Plugin,
    ];
  },
});
