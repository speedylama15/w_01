import { Node, mergeAttributes } from "@tiptap/core";

import "./VRow.css";

const name = "vRow";

const VRow = Node.create({
  name,
  group: "vRow",
  content: "vCell+",

  addNodeView() {
    return ({
      HTMLAttributes,
      decorations,
      editor,
      view,
      node,
      getPos,
      extension,
      innerDecorations,
    }) => {
      const row = document.createElement("tr");
      Object.entries(HTMLAttributes).forEach((attribute) => {
        row.setAttribute(attribute[0], attribute[1]);
      });

      return {
        dom: row,
        contentDOM: row,
      };
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
        default: "row",
        parseHTML: (element) => element.getAttribute("data-node-type"),
        renderHTML: (attributes) => ({
          "data-node-type": attributes.nodeType,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "tr" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["tr", {}, 0];
  },
});

export default VRow;
