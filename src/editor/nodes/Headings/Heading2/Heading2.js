import { mergeAttributes, Node, textblockTypeInputRule } from "@tiptap/core";

const name = "heading2";

// todo: marks

const Heading2 = Node.create({
  name,
  group: "block heading",
  content: "inline*",
  defining: true,

  addInputRules() {
    return [
      textblockTypeInputRule({
        find: new RegExp(`^(#{2})\\s$`),
        type: this.type,
        getAttributes: {
          divType: "block",
          contentType: name,
          indentLevel: 0,
        },
      }),
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
      nodeType: {
        default: "block",
        parseHTML: (element) => element.getAttribute("data-node-type"),
        renderHTML: (attributes) => ({
          "data-node-type": attributes.nodeType,
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
    };
  },

  parseHTML() {
    return [{ tag: "h2" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, this.options.blockAttrs),
      ["div", this.options.contentAttrs, ["h2", {}, 0]],
    ];
  },
});

export default Heading2;
