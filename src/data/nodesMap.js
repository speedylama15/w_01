const nodesMap = {
  "node-1": {
    id: "node-1",
    type: "note",
    // todo: make these 2 properties into a separate property
    shape: "square",
    values: [],
    // todo: make these 2 properties into a separate property
    content: { html: "OH BOY!" }, // IDEA: html
    rotation: 0,
    position: { x: 0, y: 0 },
    dimension: { width: 320, height: 100 },
    // review: store values that were given when shape was generated
    // review: on runtime, I should be able to generate an svg path and use that for intersection
    // review: or interactivity
  },
};

export default nodesMap;
