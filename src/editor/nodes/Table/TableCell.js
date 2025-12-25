import { TableCell } from "@tiptap/extension-table";

const m_TableCell = TableCell.extend({
  content: "item+",

  addAttributes() {
    return {
      // fix
      colspan: { default: 1 },
      rowspan: { default: 1 },
      // fix
      divType: {
        default: this.name,
        parseHTML: (element) => element.getAttribute("data-div-type"),
        renderHTML: (attributes) => ({
          "data-div-type": attributes.divType,
        }),
      },
    };
  },
});

export default m_TableCell;
