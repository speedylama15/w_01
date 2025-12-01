import { TableHeader } from "@tiptap/extension-table";

const MyTableHeader = TableHeader.extend({
  content: "item+",
  atom: true,
  // selectable: false,

  addAttributes() {
    return {
      ...this.parent?.(),
      // colspan: { default: 1 },
      // rowspan: { default: 1 },
      nodeType: {
        default: "block",
        parseHTML: (element) => element.getAttribute("data-node-type"),
        renderHTML: (attributes) => ({
          "data-node-type": attributes.nodeType,
        }),
      },
    };
  },
});

export default MyTableHeader;
