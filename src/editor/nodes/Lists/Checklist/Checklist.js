import { Node, mergeAttributes } from "@tiptap/core";

import {
  setMarks,
  setAttributes,
  setOptions,
} from "../../../utils/nodes/setNodeProperties";
import createChecklistDOM from "./createChecklistDOM";

const name = "checklist";

const Checklist = Node.create({
  name,

  marks: setMarks(name),

  group: "block list",

  content: "inline*",

  defining: true,

  selectable: false,

  addNodeView() {
    return ({ HTMLAttributes }) => {
      const { block, listItem } = createChecklistDOM(
        HTMLAttributes,
        this.options,
      );

      return {
        dom: block,
        contentDOM: listItem,
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
              nodeType: "block",
              contentType: name,
              indentLevel,
              checkboxStatus: "incomplete",
            })
            .run();
        },
      },
    ];
  },

  addAttributes() {
    const other = {
      checkboxStatus: {
        // review: when a node is created, it uses default
        default: "incomplete",
        // review: parseHTML seems to invoke when paste occurs
        parseHTML: (element) => {
          const status = element.getAttribute("data-checkbox-status");

          return status ? status : "incomplete";
        },
        renderHTML: (attributes) => ({
          "data-checkbox-status": attributes.checkboxStatus,
        }),
      },
    };

    return setAttributes(name, other);
  },

  addOptions() {
    return setOptions(name);
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
        ["list-item", this.options.inlineAttrs, 0],
      ],
    ];
  },
});

export default Checklist;
