import { mergeAttributes } from "@tiptap/core";
import { TableCell } from "@tiptap/extension-table";

const m_TableCell = TableCell.extend({
  marks: "bold italic underline strike textStyle highlight link",

  content: "item+",

  addAttributes() {
    return {
      colspan: { default: 1 },
      rowspan: { default: 1 },
      colwidth: {
        default: 150,
        parseHTML: (element) => element.getAttribute("colwidth"),
        renderHTML: (attributes) => {
          return {
            colwidth: attributes.colwidth || 150,
          };
        },
      },
      contentType: {
        default: this.name,
        parseHTML: (element) => element.getAttribute("data-content-type"),
        renderHTML: (attributes) => ({
          "data-content-type": attributes.contentType,
        }),
      },
      nodeType: {
        default: "content",
        parseHTML: (element) => element.getAttribute("data-node-type"),
        renderHTML: (attributes) => ({
          "data-node-type": attributes.nodeType,
        }),
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "td",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },
});

export default m_TableCell;
