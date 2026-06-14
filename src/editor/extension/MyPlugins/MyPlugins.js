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
  tableResizing,
  tableReordering,
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
      tableResizing,
      tableReordering,
    ];
  },
});

export default MyPlugins;
