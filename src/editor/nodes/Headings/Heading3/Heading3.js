import { mergeAttributes, Node, textblockTypeInputRule } from "@tiptap/core";

const name = "heading3";

// todo: marks

const Heading3 = Node.create({
  name,
  group: "block heading",
  content: "inline*",
  defining: true,

  addInputRules() {
    return [
      textblockTypeInputRule({
        find: new RegExp(`^(#{3})\\s$`),
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
    };
  },

  parseHTML() {
    return [{ tag: `div[data-content-type="${name}"]` }, { tag: "h3" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, this.options.blockAttrs),
      ["div", this.options.contentAttrs, ["heading3", {}, 0]],
    ];
  },
});

export default Heading3;
