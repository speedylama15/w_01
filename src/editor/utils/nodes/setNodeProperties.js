export const setMarks = () => {
  return "bold italic underline strike textStyle highlight link";
};

export const setAttributes = (name, other = {}) => {
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
    ...other,
  };
};

export const setOptions = (name) => {
  return {
    blockAttrs: { class: `block block-${name}` },
    contentAttrs: {
      class: `content content-${name}`,
    },
    inlineAttrs: {
      class: `inline inline-${name}`,
    },
  };
};
