import { Extension } from "@tiptap/core";

import {
  disableNativeEvents,
  trackActivity,
  handleSelection,
  renderMultiSelection,
  placeholder,
  trailingNode,
} from "../../plugin";

const MyPlugins = Extension.create({
  name: "myPlugins",

  addProseMirrorPlugins() {
    return [
      disableNativeEvents,
      trackActivity(),
      handleSelection(),
      renderMultiSelection,
      placeholder,
      trailingNode,
    ];
  },
});

export default MyPlugins;
