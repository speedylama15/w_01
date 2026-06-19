import { Node } from "@tiptap/core";

const name = "tableItem";

const TableItem = Node.create({
  name,

  marks: "bold italic underline strike textStyle highlight link",

  group: "item",

  content: "inline*",

  priority: 10000,

  parseHTML() {
    return [{ tag: "table-item" }, { tag: "th p" }, { tag: "td p" }];
  },

  renderHTML() {
    return [
      "table-item",
      {
        contenteditable: true,
        // fix
      },
      0,
    ];
  },
});

export default TableItem;
