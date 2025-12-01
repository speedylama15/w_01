import { Node, mergeAttributes } from "@tiptap/core";

import createDOMChecklist from "./createDOMChecklist";

const name = "checklist";

const Checklist = Node.create({
  name,
  // FIX: need add link
  marks: "bold italic underline strike superscript highlight textStyle",
  group: "block list",
  content: "inline*",
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

  addNodeView() {
    return ({ HTMLAttributes, editor, view, node, getPos }) => {
      const { block, listItem } = createDOMChecklist(
        HTMLAttributes,
        editor,
        view,
        node,
        getPos
      );

      return { dom: block, contentDOM: listItem };
    };
  },

  parseHTML() {
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
