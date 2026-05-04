import { Extension } from "@tiptap/core";

import BlockNativeEvents_Plugin from "./BlockNativeEvents/BlockNativeEvents_Plugin";
import { Placeholder_Plugin } from "./Placeholder/Placeholder_Plugin";
import { TrailingNode_Plugin } from "./TrailingNode/TrailingNode_Plugin";

import InsertCharacter from "../shortcuts/InsertCharacter/InsertCharacter";

export const Plugins = Extension.create({
  addProseMirrorPlugins() {
    return [
      InsertCharacter,
      BlockNativeEvents_Plugin,
      Placeholder_Plugin,
      TrailingNode_Plugin,
    ];
  },
});
