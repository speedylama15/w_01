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
        default: "block",
        parseHTML: (element) => element.getAttribute("data-div-type"),
        renderHTML: (attributes) => ({
          "data-div-type": attributes.divType,
        }),
      },
    };
  },

  addNodeView() {
    return ({
      HTMLAttributes,
      decorations,
      editor,
      extension,
      getPos,
      innerDecorations,
      node,
      view,
    }) => {
      const td = document.createElement("td");

      Object.entries(HTMLAttributes).forEach(([key, value]) => {
        if (value === null) return;

        td.setAttribute(key, value);
      });

      return {
        dom: td,
        contentDOM: td,
        ignoreMutation() {
          return true;
        },
        stopEvent() {},
        update() {},
        destroy: () => {},
      };
    };
  },
});

export default m_TableCell;
