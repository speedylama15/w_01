import { Node, mergeAttributes } from "@tiptap/core";

import createDOMChecklist from "./createDOMChecklist";

const name = "checklist";

// todo: marks
// todo: copy and paste rules

const Checklist = Node.create({
  name,

  marks: "bold italic underline strike textStyle highlight link",

  group: "block list",

  content: "inline*",

  defining: true,

  addNodeView() {
    return ({ HTMLAttributes, editor, view, node, getPos }) => {
      const width = 22;
      const height = 22;

      const { dispatch } = view;

      const { block, checkbox, listItem } = createDOMChecklist(
        HTMLAttributes,
        width,
        height,
      );

      const handleClick = () => {
        const { state } = editor;
        const { tr } = state;

        const isChecked = JSON.parse(node.attrs?.isChecked);

        tr.setNodeAttribute(getPos(), "isChecked", !isChecked);

        dispatch(tr);
      };

      checkbox.addEventListener("mousedown", handleClick);

      return {
        dom: block,
        contentDOM: listItem,
        destroy: () => {
          checkbox.removeEventListener("click", handleClick);
        },
      };
    };
  },

  addInputRules() {
    return [
      {
        find: /^\s*(\[([( |x])?\])\s$/,
        handler: ({ range, chain, state }) => {
          const { selection } = state;
          const { $from } = selection;

          const node = $from.node($from.depth);
          const indentLevel = node?.attrs.indentLevel;

          chain()
            .deleteRange(range)
            .setNode("checklist", {
              divType: "block",
              contentType: "checklist",
              indentLevel,
              isChecked: false,
            })
            .run();
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
      nodeType: {
        default: "block",
        parseHTML: (element) => element.getAttribute("data-node-type"),
        renderHTML: (attributes) => ({
          "data-node-type": attributes.nodeType,
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
      isChecked: {
        default: false,
        parseHTML: (element) =>
          element.getAttribute("data-is-checked") === "true",
        renderHTML: (attributes) => ({
          "data-is-checked": attributes.isChecked,
        }),
      },
    };
  },

  parseHTML() {
    // fix: ???
    return [{ tag: `div[data-content-type="${name}"]` }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, this.options.blockAttrs),
      [
        "div",
        this.options.contentAttrs,
        [
          "button",
          { class: "checkbox" },
          [
            "svg",
            {
              class: "checkmark",
              xmlns: "http://www.w3.org/2000/svg",
              width: "24",
              height: "24",
              viewBox: "0 0 24 24",
            },
            [
              "path",
              {
                d: "M20 6 9 17l-5-5",
              },
            ],
          ],
        ],
        ["list-item", {}, 0],
      ],
    ];
  },
});

export default Checklist;
