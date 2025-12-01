import { mergeAttributes, Node, canInsertNode } from "@tiptap/core";
import { getNearestBlockDepth } from "../../utils";
import { TextSelection } from "@tiptap/pm/state";

const createContainer = () => {
  const container = document.createElement("div");
  container.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    justify-content: space-between;
    gap: 4px;
    background-color: #fff;
    padding: 5px;
    border-radius: 10px;
  `;

  const button1 = document.createElement("button");
  button1.textContent = "Button 1";
  button1.style.cssText =
    "background: #007bff; color: white; border: none; padding: 12px 24px; margin: 8px; border-radius: 6px; cursor: pointer;";

  const button2 = document.createElement("button");
  button2.textContent = "Button 2";
  button2.style.cssText =
    "background: #28a745; color: white; border: none; padding: 12px 24px; margin: 8px; border-radius: 6px; cursor: pointer;";

  container.appendChild(button1);
  container.appendChild(button2);

  return container;
};

const createResizeButton = () => {
  const resizeContainer = document.createElement("div");
  resizeContainer.className = "resize-button-container";

  const resizeButton = document.createElement("button");
  resizeButton.className = "resize-button";
  resizeButton.textContent = "resize";

  resizeContainer.append(resizeButton);

  return resizeContainer;
};

// IDEA: resize, alignment
// IDEA: atom?
// REVIEW: make sure not to have 0 at renderHTML when there is no content

const name = "image";

const Image = Node.create({
  name,
  group: "block image",
  draggable: false,
  selectable: true,

  addOptions() {
    return {
      blockAttrs: { class: `block block-${name}` },
      contentAttrs: {
        class: `content content-${name}`,
      },
    };
  },

  // IDEA: how do I provide an argument? Like the node that was fetched via
  addNodeView() {
    return (params) => {
      const { HTMLAttributes, editor, view, node, getPos } = params;

      console.log({ HTMLAttributes, node });

      const block = document.createElement("div");
      block.className = "block block-image";
      block.setAttribute("data-id", HTMLAttributes["data-id"]);
      block.setAttribute(
        "data-content-type",
        HTMLAttributes["data-content-type"]
      );
      block.setAttribute(
        "data-indent-level",
        HTMLAttributes["data-indent-level"]
      );
      block.setAttribute("data-node-type", HTMLAttributes["data-node-type"]);

      const content = document.createElement("div");
      content.className = "content content-image";
      content.setAttribute("data-node-type", "content");

      const img = document.createElement("img");
      img.src = HTMLAttributes["src"];

      const container = createContainer();
      const resizeButtonContainer = createResizeButton();
      block.append(content);
      content.append(container, img, resizeButtonContainer);

      let isResizing = false;
      let startX, startY, startWidth;
      // IDEA
      let initialPercentage = 100;

      resizeButtonContainer.addEventListener("mousedown", (e) => {
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = parseInt(window.getComputedStyle(block).width);
        e.preventDefault();
      });

      document.addEventListener("mousemove", (e) => {
        if (isResizing) {
          const newWidth = startWidth + (e.clientX - startX);
          block.style.width = Math.max(50, newWidth) + "px";
          block.style.height = "auto";
        }
      });

      document.addEventListener("mouseup", () => {
        isResizing = false;
      });

      return { dom: block };
    };
  },

  addAttributes() {
    return {
      imageSrc: {
        default: "",
        parseHTML: (element) => element.getAttribute("src"),
        renderHTML: (attributes) => ({
          src: attributes.imageSrc,
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
      nodeType: {
        default: "block",
        parseHTML: (element) => element.getAttribute("data-node-type"),
        renderHTML: (attributes) => ({
          "data-node-type": attributes.nodeType,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: `div[data-content-type="${name}"]` }, { tag: "img" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, this.options.blockAttrs),
      ["div", this.options.contentAttrs, ["img", { src: HTMLAttributes.src }]],
    ];
  },
});

export default Image;
