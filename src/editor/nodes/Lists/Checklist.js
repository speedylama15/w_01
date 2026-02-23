import { Node, mergeAttributes } from "@tiptap/core";

import {
  setMarks,
  setAttributes,
  setOptions,
} from "../../utils/nodes/setNodeProperties";
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
    const { blockOptions, contentOptions, inlineOptions } = this.options;

    return [
      "div",
      mergeAttributes(HTMLAttributes, blockOptions),
      [
        "div",
        contentOptions,
        ["button", {}, ["svg", {}, ["path", { d: "" }]]],

        ["list-item", inlineOptions, 0],
      ],
    ];
  },
});

export default Checklist;
