import { Node, mergeAttributes } from "@tiptap/core";

const name = "vBody";

const VBody = Node.create({
  name,
  group: "vBody",
  content: "vRow+",

  addAttributes() {
    return {
      // idea: maybe add groupedBy?
      contentType: {
        default: name,
        parseHTML: (element) => element.getAttribute("data-content-type"),
        renderHTML: (attributes) => ({
          "data-content-type": attributes.contentType,
        }),
      },
      nodeType: {
        default: "tbody",
        parseHTML: (element) => element.getAttribute("data-node-type"),
        renderHTML: (attributes) => ({
          "data-node-type": attributes.nodeType,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "tbody" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["tbody", HTMLAttributes, 0];
  },
});

export default VBody;
