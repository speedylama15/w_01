import { Node, mergeAttributes } from "@tiptap/core";
import { getNearestBlockDepth } from "../../utils";

const name = "collection";

const Collection = Node.create({
  name,
  content: "block+",
  group: "block collection",
  // FIX
  selectable: true,
  defining: true,

  addOptions() {
    return {
      blockAttrs: { class: `block block-${name}` },
      contentAttrs: {
        class: `content content-${name}`,
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

  addInputRules() {
    return [
      {
        find: /^``` /,
        handler: ({ state }) => {
          const { selection, tr } = state;
          const { $from } = selection;

          const { depth } = getNearestBlockDepth($from);
          if (!depth) return;
          const node = $from.node(depth);
          const before = $from.before(depth);
          const after = before + node.nodeSize;
          const indentLevel = node?.attrs.indentLevel;

          const { paragraph, collection } = state.schema.nodes;
          const attrs = { indentLevel, contentType: name, nodeType: "block" };

          const pNode = paragraph.create(
            { nodeType: "block", contentType: "paragraph", indentLevel: 0 },
            node.content.cut(3)
          );
          const cNode = collection.create(attrs, pNode);

          tr.replaceWith(before, after, cNode);

          return tr;
        },
      },
    ];
  },

  parseHTML() {
    return [{ tag: `div[data-content-type="${name}"]` }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, this.options.blockAttrs),
      ["div", this.options.contentAttrs, 0],
    ];
  },
});

export default Collection;
