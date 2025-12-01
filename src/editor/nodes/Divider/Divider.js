import { mergeAttributes, Node, canInsertNode } from "@tiptap/core";
import { getNearestBlockDepth } from "../../utils";
import { TextSelection } from "@tiptap/pm/state";

const name = "divider";

const Divider = Node.create({
  name,
  group: "block divider",
  atom: true,
  selectable: true,

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
        find: /^(?:---|—-|___\s|\*\*\*\s)$/,
        handler: ({ state }) => {
          const { selection, tr } = state;
          const { $from } = selection;

          if (!canInsertNode(state, state.schema.nodes.divider)) return false;

          const { depth } = getNearestBlockDepth($from);
          if (!depth) return;
          const node = $from.node(depth);
          const before = $from.before(depth);
          const after = before + node.nodeSize;
          const indentLevel = node?.attrs.indentLevel;
          const dNode = state.schema.nodes.divider.create({
            nodeType: "block",
            contentType: "divider",
            indentLevel,
          });

          const pContent = node.content.cut(2);
          const pNode = state.schema.nodes.paragraph.create(
            {
              nodeType: "block",
              contentType: "paragraph",
              indentLevel,
            },
            pContent
          );

          return tr
            .insert(after, pNode)
            .setSelection(TextSelection.create(tr.doc, after + 1))
            .replaceWith(before, after, dNode);
        },
      },
    ];
  },

  parseHTML() {
    return [{ tag: `div[data-content-type="${name}"]` }, { tag: "hr" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, this.options.blockAttrs),
      ["div", this.options.contentAttrs, ["hr", {}, 0]],
    ];
  },
});

export default Divider;
