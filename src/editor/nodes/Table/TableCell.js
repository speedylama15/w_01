import { TableCell } from "@tiptap/extension-table";

const m_TableCell = TableCell.extend({
  content: "item",
  draggable: false,

  addAttributes() {
    return {
      colspan: { default: 1 },
      rowspan: { default: 1 },
      colwidth: {
        default: [150],
        parseHTML: (element) => element.getAttribute("colwidth"),
        renderHTML: (attributes) => ({
          colwidth: [attributes.colwidth],
        }),
      },
      divType: {
        default: this.name,
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

      Object.entries(HTMLAttributes).forEach((entry) => {
        const key = entry[0];
        const value = entry[1];

        td.setAttribute(key, value);
      });

      const contentDOM = document.createElement("div");
      contentDOM.className = "cell-content";
      td.append(contentDOM);

      const colResizer = document.createElement("div");
      colResizer.className = "col-resizer";
      colResizer.contentEditable = false;
      td.append(colResizer);

      return {
        dom: td,
        contentDOM: contentDOM,
      };
    };
  },

  // parseHTML() {
  //   return [{ tag: "td" }, { tag: "th" }];
  // },
});

export default m_TableCell;
