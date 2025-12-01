import { Node } from "@tiptap/core";

const name = "vCheckboxItem";

// FIX: maybe?
const createBlock = (HTMLAttributes) => {
  const block = document.createElement("div");
  block.className = "block block-checklist";
  block.setAttribute("data-id", HTMLAttributes["data-id"]);
  block.setAttribute("data-node-type", HTMLAttributes["data-node-type"]);
  block.setAttribute("data-is-checked", HTMLAttributes["data-is-checked"]);
  block.setAttribute("data-content-type", HTMLAttributes["data-content-type"]);
  block.setAttribute("data-indent-level", HTMLAttributes["data-indent-level"]);

  return block;
};

const createCheckbox = (HTMLAttributes) => {
  const button = document.createElement("button");
  Object.entries(HTMLAttributes).forEach((attribute) => {
    button.setAttribute(attribute[0], attribute[1]);
  });
  button.contentEditable = false;
  button.className = "checkbox";

  return button;
};

const createCheckmark = () => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("class", "checkmark");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M20 6L9 17L4 12");
  path.setAttribute("stroke", "currentColor");
  path.setAttribute("stroke-width", "2");
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");

  svg.appendChild(path);

  return svg;
};

const VCheckboxItem = Node.create({
  name,
  group: "item vCheckboxItem",
  selectable: false,
  atom: true,

  addNodeView() {
    return ({ HTMLAttributes, editor, view, node, getPos }) => {
      const checkbox = createCheckbox(HTMLAttributes);
      const svg = createCheckmark();

      checkbox.appendChild(svg);

      return {
        dom: checkbox,
      };
    };
  },

  addOptions() {
    return {
      blockAttrs: { class: `item item-${name}` },
      contentAttrs: {
        class: `content content-${name}`,
      },
    };
  },

  addAttributes() {
    return {
      contentType: {
        default: name,
        parseHTML: (element) => element.getAttribute("data-content-type"),
        renderHTML: (attributes) => ({
          "data-content-type": attributes.contentType,
        }),
      },
      nodeType: {
        default: "item",
        parseHTML: (element) => element.getAttribute("data-node-type"),
        renderHTML: (attributes) => ({
          "data-node-type": attributes.nodeType,
        }),
      },
      isChecked: {
        default: false,
        parseHTML: (element) =>
          element.getAttribute("data-is-checked") === "true",
        renderHTML: (attributes) => ({
          "data-is-checked": attributes.isChecked,
        }),
      },
    };
  },

  // FIX
  parseHTML() {
    return [{ tag: "checkbox-item" }];
  },

  renderHTML() {
    return ["checkbox-item", {}];
  },
  // FIX
});

export default VCheckboxItem;
