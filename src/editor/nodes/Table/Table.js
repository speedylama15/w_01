import { Table } from "@tiptap/extension-table";

import m_TableView from "./TableView";

const name = "table";

const m_Table = Table.extend({
  name,

  group: "block",

  selectable: false,

  addKeyboardShortcuts() {
    return {
      "=": ({ editor }) => {
        return editor
          .chain()
          .focus()
          .insertTable({ rows: 5, cols: 7, withHeaderRow: true })
          .run();
      },
    };
  },

  addProseMirrorPlugins() {
    return [];
  },

  addAttributes() {
    return {
      nodeType: {
        default: "block",
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
        default: name,
        parseHTML: (element) => {
          return element.getAttribute("data-content-type");
        },
        renderHTML: (attributes) => {
          return {
            "data-content-type": attributes.contentType,
          };
        },
      },
      indentLevel: {
        default: 0,
        parseHTML: (element) => {
          return element.getAttribute("data-indent-level");
        },
        renderHTML: (attributes) => {
          return {
            "data-indent-level": attributes.indentLevel,
          };
        },
      },
      // fix
    };
  },

  addNodeView() {
    return ({ HTMLAttributes, getPos, node, view }) => {
      return new m_TableView(node, 150, view, getPos, HTMLAttributes);
    };
  },

  parseHTML() {
    return [{ tag: "table" }, { tag: "div.tableWrapper" }];
  },

  // todo: renderHTML
});

export default m_Table;
