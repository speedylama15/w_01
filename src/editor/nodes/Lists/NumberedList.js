import { Node, mergeAttributes } from "@tiptap/core";

const name = "numberedList";

const NumberedList = Node.create({
  name,

  marks: "bold italic underline strike textStyle highlight link",

  group: "block list",

  content: "inline*",

  defining: true,

  selectable: false,

  addInputRules() {
    return [
      {
        find: /^(\d+)\.\s$/,
        handler: ({ range, chain, state }) => {
          const { selection } = state;
          const { $from } = selection;

          const node = $from.node($from.depth);
          const indentLevel = node?.attrs.indentLevel;

          chain()
            .deleteRange(range)
            .setNode(this.name, {
              nodeType: "block",
              contentType: name,
              indentLevel,
            })
            .run();
        },
      },
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
    return [{ tag: `div[data-content-type="${name}"]` }, { tag: "ol li" }];
  },

  renderHTML({ HTMLAttributes }) {
    const { blockOptions, contentOptions, inlineOptions } = this.options;

    return [
      "div",
      mergeAttributes(HTMLAttributes, blockOptions),
      ["div", contentOptions, ["list-item", inlineOptions, 0]],
    ];
  },
});

export default NumberedList;
