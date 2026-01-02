import { Node } from "@tiptap/core";

// TODO: will need to add some things to the marks property

const name = "paragraphItem";

const ParagraphItem = Node.create({
  name,
  group: "item",
  content: "inline*",
  priority: 1000,

  parseHTML() {
    return [{ tag: "paragraph-item" }, { tag: "th p" }, { tag: "td p" }];
  },

  renderHTML() {
    return ["paragraph-item", {}, 0];
  },
});

export default ParagraphItem;
