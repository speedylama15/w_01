import { mergeAttributes, Node, canInsertNode } from "@tiptap/core";
import { TextSelection } from "@tiptap/pm/state";

import { setAttributes } from "../../utils/nodes/setNodeProperties";
import { getDepthByNodeType } from "../../utils/depth/getDepthByNodeType";

const name = "divider";

// review: selectable: false -> disable Node Selection
// review: atom: true -> node has no directly editable content

const Divider = Node.create({
  name,

  group: "block divider",

  atom: true,

  inline: false,

  selectable: false,

  addInputRules() {
    return [
      {
        find: /^(?:---|—-|___\s|\*\*\*\s)$/,
        handler: ({ state }) => {
          const { selection, tr } = state;
          const { $from } = selection;

          if (!canInsertNode(state, state.schema.nodes.divider)) return false;

          const result = getDepthByNodeType($from, "block");
          if (!result) return;

          const { node, depth } = result;

          const before = $from.before(depth);
          const after = before + node.nodeSize;

          const { indentLevel } = node.attrs;

          const divider = state.schema.nodes.divider.create({
            nodeType: "block",
            contentType: name,
            indentLevel,
          });

          const paragraph = state.schema.nodes.paragraph.create(
            {
              nodeType: "block",
              contentType: "paragraph",
              indentLevel,
            },
            node.content.cut(2),
          );

          return tr
            .insert(after, paragraph)
            .setSelection(TextSelection.create(tr.doc, after + 1))
            .replaceWith(before, after, divider);
        },
      },
    ];
  },

  addOptions() {
    return {
      blockAttrs: { class: `block block-${name}` },
      contentAttrs: {
        class: `content content-${name}`,
      },
    };
  },

  addAttributes() {
    return setAttributes(name);
  },

  parseHTML() {
    return [{ tag: `div[data-content-type="${name}"]` }, { tag: "hr" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, this.options.blockAttrs),
      [
        "div",
        this.options.contentAttrs,
        ["div", { class: "divider-wrapper" }, ["hr", {}]],
      ],
    ];
  },
});

export default Divider;
