import { Node, mergeAttributes } from "@tiptap/core";

const name = "image";

const Image = Node.create({
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
      alignment: {
        default: "center",
        parseHTML: (element) => element.getAttribute("data-alignment"),
        renderHTML: (attributes) => ({
          "data-alignment": attributes.alignment,
        }),
      },
      // fix: should I set this as pixels or percentage?
      width: {
        default: "900",
        parseHTML: (element) => element.getAttribute("data-width"),
        renderHTML: (attributes) => ({
          "data-width": attributes.width,
        }),
      },
    };
  },

  addNodeView() {
    return ({ HTMLAttributes }) => {
      const block = document.createElement("div");
      block.className = this.options.blockOptions.class;
      Object.entries(HTMLAttributes).forEach((entry) => {
        const key = entry[0];
        const value = entry[1];

        if (key !== "src" || key !== "data-width") {
          block.setAttribute(key, value);
        }
      });

      const content = document.createElement("div");
      content.className = this.options.contentOptions.class;

      const contentWrapper = document.createElement("div");
      contentWrapper.className = "content-wrapper";

      const imageWrapper = document.createElement("div");
      imageWrapper.className = "image-wrapper";
      imageWrapper.style.width = `${HTMLAttributes["data-width"]}px`; // fix: ?

      const image = document.createElement("img");
      image.src = HTMLAttributes.src;

      const createResizer = (direction) => {
        const resizer = document.createElement("div");
        resizer.className = "image-resizer";

        resizer.dataset.imageResizerDirection = direction;

        resizer.appendChild(document.createElement("button"));

        return resizer;
      };

      imageWrapper.append(image, createResizer("left"), createResizer("right"));
      contentWrapper.appendChild(imageWrapper);
      content.appendChild(contentWrapper);
      block.appendChild(content);

      return {
        dom: block,
      };
    };
  },

  parseHTML() {
    return [{ tag: `div[data-content-type="${name}"]` }, { tag: "img" }];
  },

  renderHTML({ HTMLAttributes }) {
    const attributes = {};

    Object.entries(HTMLAttributes).forEach((entry) => {
      const key = entry[0];
      const value = entry[1];

      if (key !== "src" || key !== "data-width") attributes[key] = value;
    });

    const { blockOptions, contentOptions } = this.options;

    return [
      "div",
      mergeAttributes(attributes, blockOptions),
      [
        "div",
        contentOptions,
        [
          "div",
          { class: "content-wrapper" },
          [
            "div",
            {
              class: "image-wrapper",
              // fix
              style: `width: ${HTMLAttributes["data-width"]}px;`,
            },
            ["img", { src: HTMLAttributes.src }],
          ],
        ],
      ],
    ];
  },
});

export default Image;
