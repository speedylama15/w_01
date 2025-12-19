import { Node, mergeAttributes } from "@tiptap/core";

import { getNearestBlockDepth } from "../../../utils/getNearestBlockDepth";

const name = "verseWithCitation";

// todo: marks

const VerseWithCitation = Node.create({
  name,
  group: "block verse",
  content: "inline*",
  defining: true,

  // handles both verse and verseWithCitation
  addInputRules() {
    return [
      {
        find: /^\[([^\]]+)\] $/,
        handler: ({ state, match, range, chain }) => {
          const { $from } = state.selection;
          const { attrs } = $from.node(getNearestBlockDepth($from));

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
                citation: data,
              })
              .run();
          }
        },
      },
    ];
  },

  addOptions() {
    return {
      blockAttrs: { class: `block block-${name}` },
      contentAttrs: {
        class: `content content-${name}`,
      },
    };
  },

  addAttributes() {
    return {
      divType: {
        default: "block",
        parseHTML: (element) => element.getAttribute("data-div-type"),
        renderHTML: (attributes) => ({
          "data-div-type": attributes.divType,
        }),
      },
      contentType: {
        default: name,
        parseHTML: (element) => element.getAttribute("data-content-type"),
        renderHTML: (attributes) => ({
          "data-content-type": attributes.contentType,
        }),
      },
      indentLevel: {
        default: 0,
        parseHTML: (element) => element.getAttribute("data-indent-level"),
        renderHTML: (attributes) => ({
          "data-indent-level": attributes.indentLevel,
        }),
      },
      citation: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-citation"),
        renderHTML: (attributes) => ({
          "data-citation": attributes.citation,
        }),
      },
    };
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
          { "data-citation": HTMLAttributes["data-citation"] },
          this.options.contentAttrs
        ),
        [
          "verse-with-citation",
          {
            "data-citation": HTMLAttributes["data-citation"],
          },
          0,
        ],
      ],
    ];
  },
});

export default VerseWithCitation;
