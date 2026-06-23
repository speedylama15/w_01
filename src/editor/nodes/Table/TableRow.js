import { TableRow } from "@tiptap/extension-table";

const m_TableRow = TableRow.extend({
  selectable: false,

  // ensure that a row has at least 1 cell or header
  content: "(tableCell | tableHeader)+",

  addAttributes() {
    return {
      nodeType: {
        default: "composite",
        parseHTML: (element) => {
          return element.getAttribute("data-node-type");
        },
        renderHTML: (attributes) => {
          return {
            "data-node-type": attributes.nodeType,
          };
        },
      },
      contentType: {
        default: this.name,
        parseHTML: (element) => {
          return element.getAttribute("data-content-type");
        },
        renderHTML: (attributes) => {
          return {
            "data-content-type": attributes.contentType,
          };
        },
      },
    };
  },
});

export default m_TableRow;
