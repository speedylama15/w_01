import { Node, mergeAttributes } from "@tiptap/core";

import {
  setMarks,
  setAttributes,
  setOptions,
} from "../../../utils/nodes/setNodeProperties";

const name = "verse";

const Verse = Node.create({
  name,

  marks: setMarks(name),

  group: "block verse",

  content: "inline*",

  defining: true,

  selectable: false,

  addOptions() {
    return setOptions(name);
  },

  addAttributes() {
    const other = {
      verseNumber: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-verse-number"),
        renderHTML: (attributes) => ({
          "data-verse-number": attributes.verseNumber,
        }),
      },
    };

    return setAttributes(name, other);
  },

  parseHTML() {
    return [{ tag: `div[data-content-type="${name}"]` }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, this.options.blockAttrs),
      [
        "div",
        {
          "data-verse-number": HTMLAttributes["data-verse-number"],
          ...this.options.contentAttrs,
        },
        ["verse", this.options.inlineAttrs, 0],
      ],
    ];
  },
});

export default Verse;
