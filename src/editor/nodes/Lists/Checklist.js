import { Node, mergeAttributes } from "@tiptap/core";

const name = "checklist";

const Checklist = Node.create({
  name,

  marks: "bold italic underline strike textStyle highlight link",

  group: "block list",

  content: "inline*",

  defining: true,

  selectable: false,

  addNodeView() {
    return ({ HTMLAttributes }) => {
      const { blockOptions, contentOptions, inlineOptions } = this.options;

      const block = document.createElement("div");
      block.className = blockOptions.class;
      Object.entries(HTMLAttributes).forEach((entry) => {
        const key = entry[0];
        const value = entry[1];

        block.setAttribute(key, value);
      });

      const content = document.createElement("div");
      content.className = contentOptions.class;

      const button = document.createElement("button");
      button.className = "checkbox";

      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("fill", "none");
      svg.setAttribute("class", "complete");

      const completePath = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      completePath.classList = "complete-path";
      completePath.setAttribute("d", "M 6 13 L 10 17 L 18 7");
      completePath.setAttribute("stroke", "currentColor");
      completePath.setAttribute("stroke-width", "2");
      completePath.setAttribute("stroke-linecap", "round");
      completePath.setAttribute("stroke-linejoin", "round");

      const inProgressPath = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      inProgressPath.classList = "in-progress-path";
      inProgressPath.setAttribute("d", "M 7 12 L 17 12");
      inProgressPath.setAttribute("stroke", "currentColor");
      inProgressPath.setAttribute("stroke-width", "2");
      inProgressPath.setAttribute("stroke-linecap", "round");
      inProgressPath.setAttribute("stroke-linejoin", "round");

      const listItem = document.createElement("list-item");
      listItem.className = inlineOptions.class;

      block.appendChild(content);
      content.appendChild(button);
      button.appendChild(svg);
      content.appendChild(listItem);
      svg.appendChild(completePath);
      svg.appendChild(inProgressPath);

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
      checkboxStatus: {
        // review: when a node is created, it uses default
        default: "complete",
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
  },

  addOptions() {
    return {
      blockOptions: { class: `block block-${name}` },
      contentOptions: {
        class: `content content-${name}`,
      },
      inlineOptions: {
        class: `inline inline-${name}`,
      },
    };
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
