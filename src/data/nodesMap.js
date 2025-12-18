import { getMockNodesMap } from "./getMockNodesMap";

// const nodesMap = {
//   "node-1": {
//     id: "node-1",
//     type: "note",
//     // todo: make these 2 properties into a separate property
//     shape: "square",
//     values: [],
//     // todo: make these 2 properties into a separate property
//     content: { html: "OH BOY!" }, // IDEA: html
//     rotation: 0,
//     position: { x: 0, y: 0 },
//     dimension: { width: 400, height: 200 },
//     // review: store values that were given when shape was generated
//     // review: on runtime, I should be able to generate an svg path and use that for intersection
//     // review: or interactivity
//   },
// };

// const nodesMap = getMockNodesMap();

const nodesMap = {
  "node-1": {
    id: "node-1",
    type: "note",
    shape: "square",
    values: [],
    content: { html: "OH BOY!" }, // IDEA: html
    rotation: 0,
    position: { x: 555, y: 0 },
    dimension: { width: 500, height: 400 },
  },
};

export default nodesMap;
