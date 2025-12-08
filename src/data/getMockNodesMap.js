/**
 * Mock data for 2000 nodes, simulating a large canvas graph or whiteboard.
 * Positions are spread across a large area (10,000 x 10,000 units) to test
 * culling efficiency when zoomed in or panned far away.
 */

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

export const getMockNodesMap = () => {
  const nodesMap = {};

  const NUM_NODES = 4000;
  const CANVAS_SIZE = 20000;
  // Fixed dimensions as requested in the template
  const NODE_WIDTH = 400;
  const NODE_HEIGHT = 200;

  // Generate the nodes
  for (let i = 1; i <= NUM_NODES; i++) {
    const nodeId = `node-${i}`;

    // Distribute nodes randomly across the large canvas area
    const x = getRandomInt(CANVAS_SIZE);
    const y = getRandomInt(CANVAS_SIZE);

    // Apply a small random rotation to ensure the 'rotate' logic is tested
    const rotation = getRandomInt(4) * 15; // 0, 15, 30, 45 degrees

    // Vary the content slightly
    const contentText = `Node ${i}: Requirement for Feature ${getRandomInt(50)} - Status: ${["Draft", "Complete", "Review"][getRandomInt(3)]}`;

    nodesMap[nodeId] = {
      id: nodeId,
      type: "note",
      shape: "square",
      values: [],
      content: { html: contentText },
      rotation: rotation,
      position: { x: x, y: y },
      // Fixed dimensions used here
      dimension: { width: NODE_WIDTH, height: NODE_HEIGHT },
    };
  }

  return nodesMap;
};
