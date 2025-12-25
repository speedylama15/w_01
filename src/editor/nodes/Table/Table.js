import { Table } from "@tiptap/extension-table";

import m_TableView from "./TableView";

const name = "table";

const m_Table = Table.extend({
  name,
  group: "block",

  addProseMirrorPlugins() {
    return [];
  },

  addKeyboardShortcuts() {
    return {
      "/": ({ editor }) => {
        return editor
          .chain()
          .focus()
          .insertTable({ rows: 3, cols: 7, withHeaderRow: false })
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

  // todo: addNodeView
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
      // todo: option-ize it
      const cellMinWidth = 150;

      return new m_TableView(node, cellMinWidth, HTMLAttributes, editor);
    };
  },

  parseHTML() {
    return [{ tag: "table" }, { tag: "div.tableWrapper" }];
  },

  // todo: renderHTML
});

export default m_Table;
