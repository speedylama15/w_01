import { Node, mergeAttributes } from "@tiptap/core";

const name = "audio";

// todo: add node view for resizing and alignment funtionalities

const Audio = Node.create({
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
      audioAlignment: {
        default: "center",
        parseHTML: (element) => element.getAttribute("data-audio-alignment"),
        renderHTML: (attributes) => ({
          "data-audio-alignment": attributes.audioAlignment,
        }),
      },
      audioWidth: {
        // review: maybe I should have it be 100%
        default: "100%",
        parseHTML: (element) => element.getAttribute("data-audio-width"),
        renderHTML: (attributes) => ({
          "data-audio-width": attributes.audioWidth,
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

    return [
      "div",
      mergeAttributes(html_attributes, this.options.blockAttrs),
      [
        "div",
        {
          ...this.options.contentAttrs,
          style: `width: ${HTMLAttributes["data-audio-width"]};`,
        },
        [
          "div",
          { class: "audio-wrapper" },
          [
            "audio",
            {
              src: HTMLAttributes.src,
              controls: true,
            },
          ],
        ],
      ],
    ];
  },
});

export default Audio;
