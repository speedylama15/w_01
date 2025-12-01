import { Node, mergeAttributes } from "@tiptap/core";

import "./VCell.css";

// idea: if it's going to th, the content of VHeader MUST be paragraph item

const name = "vCell";

const VCell = Node.create({
  name,
  group: "vCell",
  // fix
  content: "item",

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
      // todo: contenteditable conditional
      const cell = document.createElement("td");
      const isContenteditable =
        node.firstChild.type.name === "vParagraphItem" ? true : false;
      cell.contentEditable = isContenteditable;

      Object.entries(HTMLAttributes).forEach((attribute) => {
        cell.setAttribute(attribute[0], attribute[1]);
      });

      return {
        dom: cell,
        contentDOM: cell,
        stopEvent() {},
        ignoreMutation() {},
      };
    };
  },

  addAttributes() {
    return {
      // idea: contenteditable?
      contentType: {
        default: name,
        parseHTML: (element) => element.getAttribute("data-content-type"),
        renderHTML: (attributes) => ({
          "data-content-type": attributes.contentType,
        }),
      },
      nodeType: {
        default: "cell",
        parseHTML: (element) => element.getAttribute("data-node-type"),
        renderHTML: (attributes) => ({
          "data-node-type": attributes.nodeType,
        }),
      },
      colwidth: {
        default: 150,
        parseHTML: (element) => element.getAttribute("colwidth"),
        renderHTML: (attributes) => ({
          colwidth: attributes.colwidth,
        }),
      },
    };
  },

  // review: this does not a classname because I can just use td
  parseHTML() {
    return [{ tag: "td" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["td", HTMLAttributes, 0];
  },
});

export default VCell;
