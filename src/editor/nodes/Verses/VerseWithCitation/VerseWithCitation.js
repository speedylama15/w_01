import { Node, mergeAttributes } from "@tiptap/core";

import {
  setMarks,
  setAttributes,
  setOptions,
} from "../../../utils/nodes/setNodeProperties";
import { getDepthByNodeType } from "../../../utils/depth/getDepthByNodeType";

const name = "verseWithCitation";

const VerseWithCitation = Node.create({
  name,

  marks: setMarks(name),

  group: "block verse",

  content: "inline*",

  defining: true,

  addInputRules() {
    return [
      {
        find: /^\[([^\]]+)\] $/,
        handler: ({ state, match, range, chain }) => {
          const result = getDepthByNodeType(state.selection.$from, "block");

          if (!result) return null;

          const { attrs } = result.node;

          const data = match[1];
          const isNumber = /^\d+$/.test(data);

          if (isNumber) {
            chain()
              .deleteRange(range)
              .setNode("verse", {
                ...attrs,
                verseNumber: parseInt(data),
              })
              .run();
          } else {
            chain()
              .deleteRange(range)
              .setNode("verseWithCitation", {
                ...attrs,
                verseCitation: data,
              })
              .run();
          }
        },
      },
    ];
  },

  addOptions() {
    return setOptions(name);
  },

  addAttributes() {
    const other = {
      verseCitation: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-verse-citation"),
        renderHTML: (attributes) => ({
          "data-verse-citation": attributes.verseCitation,
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
        mergeAttributes(
          { "data-verse-citation": HTMLAttributes["data-verse-citation"] },
          this.options.contentAttrs,
        ),
        ["verse-with-citation", this.options.inlineAttrs, 0],
      ],
    ];
  },
});

export default VerseWithCitation;
