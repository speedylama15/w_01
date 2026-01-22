import { TableRow } from "@tiptap/extension-table";

const m_TableRow = TableRow.extend({
  addAttributes() {
    return {
      elementType: {
        default: "tr",
        parseHTML: (element) => element.getAttribute("data-element-type"),
        renderHTML: (attributes) => ({
          "data-element-type": attributes.elementType,
        }),
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
});

export default m_TableRow;
