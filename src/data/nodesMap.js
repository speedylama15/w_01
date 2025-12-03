const nodesMap = {
  "node-1": {
    id: "node-1",
    type: "note",
    shape: "square",
    content: { html: "hi" }, // IDEA: html
    rotation: 0,
    position: { x: 0, y: 0 },
    dimension: { width: 320, height: 100 },
    // idea: perhaps I need a property here called svg path
    // review: path and drawing are almost identical
    // idea: while drawing produce an svg path string
  },
};

// const nodesMap = {};

export default nodesMap;
