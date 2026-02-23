import { mergeAttributes, Node, textblockTypeInputRule } from "@tiptap/core";

const name = "heading2";

const Heading2 = Node.create({
  name,

  marks: "italic underline strike textStyle highlight",

  group: "block heading",

  content: "inline*",

  defining: true,

  selectable: false,

  addInputRules() {
    return [
      textblockTypeInputRule({
        find: new RegExp(`^(#{2})\\s$`),
        type: this.type,
        getAttributes: {
          nodeType: "block",
          contentType: name,
          indentLevel: 0,
        },
      }),
    ];
  },

  addAttributes() {
    return {
      nodeType: {
        default: "block",
        parseHTML: (element) => {
          return element.getAttribute("data-node-type");
        },
        renderHTML: (attributes) => {
          return {
            "data-node-type": attributes.nodeType,
          };
        },
      },
      contentType: {
        default: name,
        parseHTML: (element) => {
          return element.getAttribute("data-content-type");
        },
        renderHTML: (attributes) => {
          return {
            "data-content-type": attributes.contentType,
          };
        },
      },
      indentLevel: {
        default: 0,
        parseHTML: (element) => {
          return element.getAttribute("data-indent-level");
        },
        renderHTML: (attributes) => {
          return {
            "data-indent-level": attributes.indentLevel,
          };
        },
      },
    };
  },

  addOptions() {
    return {
      blockOptions: { class: `block block-${name}` },
      contentOptions: {
        class: `content content-${name}`,
      },
      inlineOptions: {
        class: `inline inline-${name}`,
      },
    };
  },

  parseHTML() {
    return [{ tag: "h2" }];
  },

  renderHTML({ HTMLAttributes }) {
    const { blockOptions, contentOptions, inlineOptions } = this.options;

    return [
      "div",
      mergeAttributes(HTMLAttributes, blockOptions),
      ["div", contentOptions, ["h2", inlineOptions, 0]],
    ];
  },
});

export default Heading2;
