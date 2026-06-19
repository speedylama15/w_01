import { mergeAttributes, Node } from "@tiptap/core";

export const Table = Node.create({
  name: "table",

  group: "block",
  content: "tableRow+",
  isolating: true, // keeps backspace/selection from "leaking" out of the table into surrounding content
  selectable: false,

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
      isHeaderColumn: {
        default: false,
        parseHTML: (element) => {
          return element.getAttribute("data-is-header-column");
        },
        renderHTML: (attributes) => {
          return {
            "data-is-header-column": attributes.isHeaderColumn,
          };
        },
      },
      isHeaderRow: {
        default: false,
        parseHTML: (element) => {
          return element.getAttribute("data-is-header-row");
        },
        renderHTML: (attributes) => {
          return {
            "data-is-header-row": attributes.isHeaderRow,
          };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: "table" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["table", HTMLAttributes, ["tbody", 0]];
  },

  addNodeView() {
    return ({ HTMLAttributes }) => {
      const block = document.createElement("div");
      block.className = "block block-table";
      // block.contentEditable = false; // fix

      const content = document.createElement("div");
      content.className = "content content-table";

      const contentWrapper = document.createElement("div");
      contentWrapper.className = "contentWrapper";

      const tableWrapper = document.createElement("div");
      tableWrapper.className = "tableWrapper";

      const table = document.createElement("table");
      const colgroup = document.createElement("colgroup");
      colgroup.contentEditable = false;
      colgroup.style.userSelect = "none";
      const tbody = document.createElement("tbody");

      block.append(content);
      content.append(contentWrapper);
      contentWrapper.append(tableWrapper);
      tableWrapper.append(table);
      table.append(
        // colgroup, // fix: colgroup is an issue
        tbody,
      );

      // rows/cells render and get managed by ProseMirror inside tbody
      return {
        dom: block,
        contentDOM: tbody,
      };
    };
  },
});

export const TableRow = Node.create({
  name: "tableRow",

  content: "(tableCell | tableHeader)+",
  selectable: false,

  parseHTML() {
    return [{ tag: "tr" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["tr", HTMLAttributes, 0];
  },
});

export const TableHeader = Node.create({
  name: "tableHeader",

  content: "block+",
  isolating: true,

  addAttributes() {
    return {
      colspan: { default: 1 },
      rowspan: { default: 1 },
    };
  },

  parseHTML() {
    return [{ tag: "th" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["th", HTMLAttributes, 0];
  },
});

export const TableCell = Node.create({
  name: "tableCell",

  marks: "bold italic underline strike textStyle highlight link",

  content: "inline+", // swap to 'inline*' if you want plain-text-only cells
  isolating: true, // backspace at start of cell won't merge into previous cell/row
  selectable: false,
  whitespace: "pre",

  addAttributes() {
    return {
      colspan: { default: 1 },
      rowspan: { default: 1 },
    };
  },

  parseHTML() {
    return [{ tag: "td" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["td", HTMLAttributes, 0];
  },

  addNodeView() {
    return ({ HTMLAttributes }) => {
      const dom = document.createElement("td");
      dom.contentEditable = true; // idea
      // dom.contentEditable = false; // idea

      Object.entries(HTMLAttributes).forEach(([key, value]) => {
        if (value != null) dom.setAttribute(key, value);
      });

      return {
        dom,
        contentDOM: dom,
      };
    };
  },
});
