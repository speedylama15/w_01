import { Node, mergeAttributes } from "@tiptap/core";

import {
  setMarks,
  setAttributes,
  setOptions,
} from "../../utils/nodes/setNodeProperties";

const name = "paragraph";

const Paragraph = Node.create({
  name,

  marks: setMarks(name),

  group: "block",

  content: "inline*",

  priority: 1000,

  addAttributes() {
    return setAttributes(name);
  },

  addOptions() {
    return setOptions(name);
  },

  parseHTML() {
    return [{ tag: "p" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, this.options.blockAttrs),
      ["div", this.options.contentAttrs, ["p", this.options.inlineAttrs, 0]],
    ];
  },
});

export default Paragraph;
