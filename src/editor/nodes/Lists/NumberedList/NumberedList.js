import { Node, mergeAttributes } from "@tiptap/core";

const name = "numberedList";

// todo: marks
// todo: copy and paste rules
// FIX: make sure add more classes inside of NumberedList.css's reset

const NumberedList = Node.create({
  name,
  group: "block list",
  content: "inline*",
  defining: true,

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
              divType: "block",
              contentType: name,
              indentLevel,
            })
            .run();
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
    // fix: ???
    return [{ tag: `div[data-content-type="${name}"]` }, { tag: "ol li" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, this.options.blockAttrs),
      ["div", this.options.contentAttrs, ["list-item", {}, 0]],
    ];
  },
});

export default NumberedList;
