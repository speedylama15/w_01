const nodesMap = {
  "node-1": {
    id: "node-1",
    type: "note",
    shape: "square",
    content: { html: "hi" }, // IDEA: html
    rotation: 0,
    position: { x: 0, y: 0 },
    dimension: { width: 320, height: 100 },
    // review: store values that were given when shape was generated
    // review: on runtime, I should be able to generate an svg path and use that for intersection
    // review: or interactivity
  },
};

// const nodesMap = {};

export default nodesMap;
