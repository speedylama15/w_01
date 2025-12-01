import { mergeAttributes, Node, textblockTypeInputRule } from "@tiptap/core";

const name = "heading2";

const Heading2 = Node.create({
  name,
  // REVIEW: this does not need a link
  marks: "bold italic underline strike superscript highlight textStyle",
  group: "block heading",
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

  // FIX: indent cannot occur. Remains at 0
  // FIX: Enter -> create a paragraph
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

  addInputRules() {
    return [
      textblockTypeInputRule({
        find: new RegExp(`^(#{2})\\s$`),
        type: this.type,
        getAttributes: {
          indentLevel: 0,
          contentType: name,
          nodeType: "block",
        },
      }),
    ];
  },

  parseHTML() {
    return [{ tag: `div[data-content-type="${name}"]` }, { tag: "h2" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, this.options.blockAttrs),
      ["div", this.options.contentAttrs, ["heading2", {}, 0]],
    ];
  },
});

export default Heading2;
