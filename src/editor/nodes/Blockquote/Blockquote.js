import { Node, mergeAttributes } from "@tiptap/core";

import {
  setMarks,
  setAttributes,
  setOptions,
} from "../../utils/nodes/setNodeProperties";

const name = "blockquote";

const Blockquote = Node.create({
  name,

  marks: setMarks(name),

  group: "block blockquote",

  content: "inline*",

  selectable: false,

  addInputRules() {
    return [
      {
        find: /^\s*>\s$/,
        handler: ({ range, chain, state }) => {
          const { selection } = state;
          const { $from } = selection;

          const node = $from.node($from.depth);
          const indentLevel = node?.attrs.indentLevel;

          chain()
            .deleteRange(range)
            .setNode(this.name, {
              nodeType: "block",
              contentType: name,
              indentLevel,
            })
            .run();
        },
      },
    ];
  },

  addAttributes() {
    return setAttributes(name);
  },

  addOptions() {
    return setOptions(name);
  },

  parseHTML() {
    return [{ tag: `div[data-content-type="${name}"]` }, { tag: "blockquote" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, this.options.blockAttrs),
      [
        "div",
        this.options.contentAttrs,
        ["blockquote", this.options.inlineAttrs, 0],
      ],
    ];
  },
});

export default Blockquote;
