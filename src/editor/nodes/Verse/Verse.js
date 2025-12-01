import { Node, mergeAttributes } from "@tiptap/core";

const name = "verse";

const Verse = Node.create({
  name,
  // IDEA: link
  marks: "bold italic underline strike superscript highlight textStyle",
  group: "block verse",
  content: "inline*",
  defining: true,

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
      nodeType: {
        default: "block",
        parseHTML: (element) => element.getAttribute("data-node-type"),
        renderHTML: (attributes) => ({
          "data-node-type": attributes.nodeType,
        }),
      },
      verseNumber: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-verse-number"),
        renderHTML: (attributes) => ({
          "data-verse-number": attributes.verseNumber,
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
          { "data-verse-number": HTMLAttributes["data-verse-number"] },
          this.options.contentAttrs
        ),
        [
          "verse",
          { "data-verse-number": HTMLAttributes["data-verse-number"] },
          0,
        ],
      ],
    ];
  },
});

export default Verse;
