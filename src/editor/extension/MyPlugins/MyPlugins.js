import { Extension } from "@tiptap/core";

import {
  disableNativeEvents,
  trackActivity,
  handleSelection,
  placeholder,
  trailingNode,
  marqueeSelection,
  blockHandle,
  slashCommand,
} from "../../plugin";

const MyPlugins = Extension.create({
  name: "myPlugins",

  addProseMirrorPlugins() {
    return [
      disableNativeEvents,
      trackActivity(),
      handleSelection(),
      placeholder,
      trailingNode,
      marqueeSelection,
      blockHandle(),
      slashCommand(this.editor),
    ];
  },
});

export default MyPlugins;
