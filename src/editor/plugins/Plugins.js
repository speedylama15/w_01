import { Extension } from "@tiptap/core";

import { Placeholder_Plugin } from "./Placeholder/Placeholder_Plugin";
import { TrailingNode_Plugin } from "./TrailingNode/TrailingNode_Plugin";
import { EditorMarqueeSelection_Plugin } from "./EditorMarqueeSelection/EditorMarqueeSelection_Plugin";
import { BlockHandle_Plugin } from "./BlockHandle/BlockHandle_Plugin";
import { RenderSelection_Plugin } from "./RenderSelection/RenderSelection_Plugin";

export const Plugins = Extension.create({
  addProseMirrorPlugins() {
    return [
      Placeholder_Plugin,
      TrailingNode_Plugin,
      EditorMarqueeSelection_Plugin(this.editor),
      // BlockHandle_Plugin,
      RenderSelection_Plugin,
    ];
  },
});
