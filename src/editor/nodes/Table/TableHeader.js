import { mergeAttributes } from "@tiptap/core";
import { TableHeader } from "@tiptap/extension-table";
import { DOMParser, Fragment } from "@tiptap/pm/model";

const m_TableHeader = TableHeader.extend({
  marks: "bold italic underline strike textStyle highlight link",

  content: "item+",

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
        tag: "th",
        getContent(dom, schema) {
          const parser = DOMParser.fromSchema(schema);
          const parsedDOM = parser.parse(dom);

          const arr = [];

          parsedDOM.content.descendants((node) => {
            // fetches TextNode guaranteed
            if (node.isText) {
              const { paragraphItem } = schema.nodes;

              const item = paragraphItem.create({}, Fragment.from(node));

              arr.push(item);

              return false;
            }

            return undefined;
          });

          return Fragment.fromArray(arr);
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "th",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },
});

export default m_TableHeader;
