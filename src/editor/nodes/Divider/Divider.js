import { mergeAttributes, Node, canInsertNode } from "@tiptap/core";
import { TextSelection } from "@tiptap/pm/state";

import { getDepthByNodeType } from "../../utils/depth/getDepthByNodeType";

const name = "divider";

const Divider = Node.create({
  name,

  marks: "",

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
    };
  },

  addOptions() {
    return {
      blockOptions: { class: `block block-${name}` },
      contentOptions: {
        class: `content content-${name}`,
      },
    };
  },

  parseHTML() {
    return [{ tag: `div[data-content-type="${name}"]` }, { tag: "hr" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, this.options.blockOptions),
      [
        "div",
        this.options.contentOptions,
        ["div", { class: "divider-wrapper" }, ["hr", {}]],
      ],
    ];
  },
});

export default Divider;
