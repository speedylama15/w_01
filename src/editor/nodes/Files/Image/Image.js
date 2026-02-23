import { Node, mergeAttributes } from "@tiptap/core";

const name = "image";

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
      alignment: {
        default: "center",
        parseHTML: (element) => element.getAttribute("data-alignment"),
        renderHTML: (attributes) => ({
          "data-alignment": attributes.alignment,
        }),
      },
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

      Object.entries(HTMLAttributes).forEach((entry) => {
        const key = entry[0];
        const value = entry[1];

        if (key !== "src" || key !== "data-width")
          block.setAttribute(key, value);
      });

      block.className = this.options.blockAttrs.class;

      const content = document.createElement("div");
      content.className = this.options.contentAttrs.class;

      const wrapper = document.createElement("div");
      wrapper.style.width = `${HTMLAttributes["data-width"]}px`;
      wrapper.className = "image-wrapper";

      const leftResizer = document.createElement("div");
      leftResizer.className = "image-resizer image-left-resizer";
      leftResizer.setAttribute("data-direction", "left");
      leftResizer.append(document.createElement("div"));

      const rightResizer = document.createElement("div");
      rightResizer.className = "image-resizer image-right-resizer";
      rightResizer.setAttribute("data-direction", "right");
      rightResizer.append(document.createElement("div"));

      const image = document.createElement("img");
      // image.style.width = `${HTMLAttributes["data-width"]}px`;
      image.src = HTMLAttributes.src;

      block.append(content);
      content.append(wrapper);
      wrapper.append(image, leftResizer, rightResizer);

      return {
        dom: block,
      };
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
          style: `width: ${HTMLAttributes["data-width"]}px;`,
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
