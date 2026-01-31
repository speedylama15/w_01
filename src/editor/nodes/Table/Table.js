import { Table } from "@tiptap/extension-table";

import m_TableView from "./TableView";

const name = "table";

const m_Table = Table.extend({
  name,
  group: "block",

  addKeyboardShortcuts() {
    return {
      "/": ({ editor }) => {
        return editor
          .chain()
          .focus()
          .insertTable({ rows: 5, cols: 7, withHeaderRow: true })
          .run();
      },
    };
  },

  addProseMirrorPlugins() {
    // fix: const plugins = this.parent?.() || [];

    return [];
  },

  addAttributes() {
    return {
      elementType: {
        default: "table",
        parseHTML: (element) => element.getAttribute("data-element-type"),
        renderHTML: (attributes) => ({
          "data-element-type": attributes.elementType,
        }),
      },
      // either block or content
      // table is block
      // tableRow, tableHeader, tableCell are all content
      nodeType: {
        default: "block",
        parseHTML: (element) => element.getAttribute("data-node-type"),
        renderHTML: (attributes) => ({
          "data-node-type": attributes.nodeType,
        }),
      },
      contentType: {
        default: name,
        parseHTML: (element) => element.getAttribute("data-content-type"),
        renderHTML: (attributes) => ({
          "data-content-type": attributes.contentType,
        }),
      },
      indentLevel: {
        default: 0,
        parseHTML: (element) => element.getAttribute("data-indent-level"),
        renderHTML: (attributes) => ({
          "data-indent-level": attributes.indentLevel,
        }),
      },
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
