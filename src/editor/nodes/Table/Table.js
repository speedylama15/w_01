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

  addAttributes() {
    return {
      divType: {
        default: "block",
        parseHTML: (element) => element.getAttribute("data-div-type"),
        renderHTML: (attributes) => ({
          "data-div-type": attributes.divType,
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
