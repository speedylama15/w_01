import { Node, mergeAttributes } from "@tiptap/core";

const name = "audio";

const Audio = Node.create({
  name,

  marks: "",

  group: "block file",

  atom: true,

  inline: false,

  selectable: false,

  addOptions() {
    return {
      blockOptions: { class: `block block-${name}` },
      contentOptions: {
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
      src: {
        default: "",
        parseHTML: (element) => element.getAttribute("src"),
        renderHTML: (attributes) => ({
          src: attributes.src,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: `div[data-content-type="${name}"]` }, { tag: "audio" }];
  },

  renderHTML({ HTMLAttributes }) {
    const html_attributes = {};

    Object.entries(HTMLAttributes).forEach((entry) => {
      const key = entry[0];
      const value = entry[1];

      if (key !== "src") html_attributes[key] = value;
    });

    const { blockOptions, contentOptions } = this.options;

    return [
      "div",
      mergeAttributes(html_attributes, blockOptions),
      [
        "div",
        contentOptions,
        [
          "audio",
          {
            src: HTMLAttributes.src,
            controls: true,
          },
        ],
      ],
    ];
  },
});

export default Audio;
