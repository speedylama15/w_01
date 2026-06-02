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
  toolbarMenu,
  dragAndDrop,
  cellSelecting,
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
      toolbarMenu(this.editor),
      dragAndDrop(this.editor),
      cellSelecting,
    ];
  },
});

export default MyPlugins;
