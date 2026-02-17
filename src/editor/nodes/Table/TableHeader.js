import { TableHeader } from "@tiptap/extension-table";

const m_TableHeader = TableHeader.extend({
  content: "item+",
  draggable: false,
  selectable: false,

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

  addNodeView() {
    return ({ HTMLAttributes }) => {
      const th = document.createElement("th");

      Object.entries(HTMLAttributes).forEach((entry) => {
        const key = entry[0];
        const value = entry[1];

        th.setAttribute(key, value);
      });

      const contentDOM = document.createElement("div");
      contentDOM.className = "cell-content";
      th.append(contentDOM);

      return {
        dom: th,
        contentDOM,
      };
    };
  },
});

export default m_TableHeader;
