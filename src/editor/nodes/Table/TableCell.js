import { mergeAttributes } from "@tiptap/core";
import { TableCell } from "@tiptap/extension-table";
import { DOMParser, Fragment } from "@tiptap/pm/model";

const m_TableCell = TableCell.extend({
  marks: "bold italic underline strike textStyle highlight link",

  content: "item",

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
      nodeType: {
        default: "content",
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

  parseHTML() {
    return [
      {
        tag: "td",
        getContent(dom, schema) {
          const parser = DOMParser.fromSchema(schema);
          const parsedDOM = parser.parse(dom);

          let text = "";

          parsedDOM.content.descendants((node) => {
            // fetches TextNode guaranteed
            if (node.isText) {
              text += node.textContent;

              return false;
            }

            return undefined;
          });

          const cell = schema.nodes.tableCell.create(null, schema.text(text));

          return cell;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "td",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },
});

export default m_TableCell;
