export function getNodeAABB(node) {
  const { position, dimension, rotation } = node;
  const { x, y } = position;
  const { width: w, height: h } = dimension;

  const theta = rotation; // Angle in radians

  // 1. Calculate the center point
  const cx = x + w / 2;
  const cy = y + h / 2;

  const hw = w / 2;
  const hh = h / 2;

  // Pre-calculate sin and cos
  const cosTheta = Math.cos(theta);
  const sinTheta = Math.sin(theta);

  // 2. Calculate AABB Half-Extents (AABB_hw, AABB_hh)
  // This is the core formula, calculating the projection of half-width and half-height
  // onto the axes, accounting for rotation.
  const AABB_hw = Math.abs(hw * cosTheta) + Math.abs(hh * sinTheta);
  const AABB_hh = Math.abs(hw * sinTheta) + Math.abs(hh * cosTheta);

  // 3. Calculate the final AABB corners (minX, minY, maxX, maxY)
  const minX = cx - AABB_hw;
  const maxX = cx + AABB_hw;
  const minY = cy - AABB_hh;
  const maxY = cy + AABB_hh;

  return { minX, minY, maxX, maxY, node };
}
