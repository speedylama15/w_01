import { Node, mergeAttributes } from "@tiptap/core";

const name = "paragraph";

const Paragraph = Node.create({
  name,
  marks: "bold italic underline strike superscript highlight textStyle",
  group: "block paragraph",
  content: "inline*",
  priority: 200,

  addOptions() {
    return {
      blockAttrs: { class: `block block-${name}` },
      contentAttrs: {
        class: `content content-${name}`,
      },
    };
  },

  parseHTML() {
    return [{ tag: `div[data-content-type="${name}"]` }, { tag: "p" }];
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
    };
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, this.options.blockAttrs),
      ["div", this.options.contentAttrs, ["paragraph", {}, 0]],
    ];
  },
});

export default Paragraph;
