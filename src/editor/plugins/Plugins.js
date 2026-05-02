import { Extension } from "@tiptap/core";

import { Placeholder_Plugin } from "./Placeholder/Placeholder_Plugin";
import { TrailingNode_Plugin } from "./TrailingNode/TrailingNode_Plugin";

export const Plugins = Extension.create({
  addProseMirrorPlugins() {
    return [Placeholder_Plugin, TrailingNode_Plugin];
  },
});
