import { TableHeader } from "@tiptap/extension-table";

const m_TableHeader = TableHeader.extend({
  content: "item+",
  atom: true,

  addAttributes() {
    return {
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

export default m_TableHeader;
