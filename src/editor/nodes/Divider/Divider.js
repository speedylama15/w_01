import { mergeAttributes, Node, canInsertNode } from "@tiptap/core";
import { TextSelection } from "@tiptap/pm/state";

import { getNearestBlockDepth } from "../../utils/getNearestBlockDepth";

const name = "divider";

const Divider = Node.create({
  name,
  group: "block divider",
  atom: true,
  inline: false,
  selectable: true,

  addInputRules() {
    return [
      {
        find: /^(?:---|—-|___\s|\*\*\*\s)$/,
        handler: ({ state }) => {
          const { selection, tr } = state;
          const { $from } = selection;

          if (!canInsertNode(state, state.schema.nodes.divider)) return false;

          const depth = getNearestBlockDepth($from);
          if (!depth) return;

          const node = $from.node(depth);

          const before = $from.before(depth);
          const after = before + node.nodeSize;

          const { indentLevel } = node.attrs;

          const divider = state.schema.nodes.divider.create({
            divType: "block",
            contentType: name,
            indentLevel,
          });

          const paragraph = state.schema.nodes.paragraph.create(
            {
              divType: "block",
              contentType: "paragraph",
              indentLevel,
            },
            node.content.cut(2)
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
