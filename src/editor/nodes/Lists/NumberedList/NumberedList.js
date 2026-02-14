import { Node, mergeAttributes } from "@tiptap/core";

import {
  setMarks,
  setAttributes,
  setOptions,
} from "../../../utils/nodes/setNodeProperties";

const name = "numberedList";

// FIX: make sure add more classes inside of NumberedList.css's reset

const NumberedList = Node.create({
  name,

  marks: setMarks(name),

  group: "block list",

  content: "inline*",

  defining: true,

  addInputRules() {
    return [
      {
        find: /^(\d+)\.\s$/,
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
    return [{ tag: `div[data-content-type="${name}"]` }, { tag: "ol li" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, this.options.blockAttrs),
      [
        "div",
        this.options.contentAttrs,
        ["list-item", this.options.inlineAttrs, 0],
      ],
    ];
  },
});

export default NumberedList;
