import { Node, mergeAttributes } from "@tiptap/core";

const name = "image";

// todo: add node view for resizing and alignment funtionalities

const Image = Node.create({
  name,

  group: "block file",

  atom: true,

  inline: false,

  selectable: false,

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
      src: {
        default: "",
        parseHTML: (element) => element.getAttribute("src"),
        renderHTML: (attributes) => ({
          src: attributes.src,
        }),
      },
      imgAlignment: {
        default: "center",
        parseHTML: (element) => element.getAttribute("data-image-alignment"),
        renderHTML: (attributes) => ({
          "data-image-alignment": attributes.imgAlignment,
        }),
      },
      imgWidth: {
        // review: maybe I should have it be 100%
        default: "100%",
        parseHTML: (element) => element.getAttribute("data-image-width"),
        renderHTML: (attributes) => ({
          "data-image-width": attributes.imgWidth,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: `div[data-content-type="${name}"]` }, { tag: "img" }];
  },

  renderHTML({ HTMLAttributes }) {
    const html_attributes = {};

    Object.entries(HTMLAttributes).forEach((entry) => {
      const key = entry[0];
      const value = entry[1];

      if (key !== "src") html_attributes[key] = value;
    });

    return [
      "div",
      mergeAttributes(html_attributes, this.options.blockAttrs),
      [
        "div",
        {
          ...this.options.contentAttrs,
          style: `width: ${HTMLAttributes["data-image-width"]};`,
        },
        [
          "div",
          { class: "image-wrapper" },
          [
            "img",
            {
              src: HTMLAttributes.src,
            },
          ],
        ],
      ],
    ];
  },
});

export default Image;
