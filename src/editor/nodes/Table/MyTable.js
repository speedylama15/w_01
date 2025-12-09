import { Table } from "@tiptap/extension-table";

import MyTableView from "./MyTableView";

const name = "table";

const MyTable = Table.extend({
  // FIX
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
      nodeType: {
        default: "block",
        parseHTML: (element) => element.getAttribute("data-node-type"),
        renderHTML: (attributes) => ({
          "data-node-type": attributes.nodeType,
        }),
      },
    };
  },

  // debug
  // addProseMirrorPlugins() {
  //   return [...this.parent?.()];
  // },

  addProseMirrorPlugins() {
    const plugins = this.parent?.().filter(
      (plugin) => plugin.key !== "selectingCells$"
    );

    return [];
  },
  // debug

  addNodeView() {
    return (params) => {
      const { node, HTMLAttributes, editor } = params;

      return new MyTableView(
        node,
        this.options.cellMinWidth,
        HTMLAttributes,
        editor
      );
    };
  },

  parseHTML() {
    return [{ tag: "table" }, { tag: "div.tableWrapper" }];
  },
});

export default MyTable;
