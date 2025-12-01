import { Node, mergeAttributes } from "@tiptap/core";

const name = "verseWithCitation";

const VerseWithCitation = Node.create({
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
      citation: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-citation"),
        renderHTML: (attributes) => ({
          "data-citation": attributes.citation,
        }),
      },
      // IDEA
      // isIconSet
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
        this.options.contentAttrs,
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
