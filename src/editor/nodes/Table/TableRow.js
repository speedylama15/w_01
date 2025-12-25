import { TableRow } from "@tiptap/extension-table";

const m_TableRow = TableRow.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      colspan: { default: 1 },
      rowspan: { default: 1 },
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

export default m_TableRow;
