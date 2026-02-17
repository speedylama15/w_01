import { mergeAttributes, Node, textblockTypeInputRule } from "@tiptap/core";

import {
  setAttributes,
  setOptions,
} from "../../../utils/nodes/setNodeProperties";

const name = "heading3";

const Heading3 = Node.create({
  name,

  marks: "italic underline strike textStyle highlight",

  group: "block heading",

  content: "inline*",

  defining: true,

  selectable: false,

  addInputRules() {
    return [
      textblockTypeInputRule({
        find: new RegExp(`^(#{3})\\s$`),
        type: this.type,
        getAttributes: {
          nodeType: "block",
          contentType: name,
          indentLevel: 0,
        },
      }),
    ];
  },

  addAttributes() {
    return setAttributes(name);
  },

  addOptions() {
    return setOptions(name);
  },

  parseHTML() {
    return [{ tag: "h3" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, this.options.blockAttrs),
      ["div", this.options.contentAttrs, ["h3", this.options.inlineAttrs, 0]],
    ];
  },
});

export default Heading3;
