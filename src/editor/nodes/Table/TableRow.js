import { TableRow } from "@tiptap/extension-table";

const m_TableRow = TableRow.extend({
  addAttributes() {
    return {
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
