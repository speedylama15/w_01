import useEdges from "../../stores/useEdges";
import useNodes from "../../stores/useNodes";

import { getNodeAABB } from "../../utils/getNodeAABB";
import { rotateCoords } from "../../utils/rotateCoords";

const getCenterXY = (node) => {
  const { position, dimension } = node;
  const { x, y } = position;
  const { width, height } = dimension;

  return { x: x + width / 2, y: y + height / 2 };
};

const getCoords = (node, centerXY, offsetXY) => {
  const { dimension } = node;
  const { width, height } = dimension;

  const halfWidth = width / 2;
  const halfHeight = height / 2;

  const factorX = halfWidth * offsetXY.x;
  const factorY = halfHeight * offsetXY.y;

  return { x: centerXY.x + factorX, y: centerXY.y + factorY };
};

const Edge = ({ edgeID }) => {
  const edge = useEdges((state) => state.edgesMap[edgeID]);
  const {
    id,
    sourceID,
    sourceLoc,
    sourceOffset,
    targetID,
    targetLoc,
    targetOffset,
  } = edge;

  const sourceNode = useNodes((state) => state.nodesMap[sourceID]);
  const targetNode = useNodes((state) => state.nodesMap[targetID]);

  const sourceCenterXY = getCenterXY(sourceNode);
  const targetCenterXY = getCenterXY(targetNode);

  // unrotated coords
  const un_sourceCoords = getCoords(sourceNode, sourceCenterXY, sourceOffset);
  const un_targetCoords = getCoords(targetNode, targetCenterXY, targetOffset);

  // rotated coords
  const ro_sourceCoords = rotateCoords(
    un_sourceCoords,
    sourceCenterXY,
    sourceNode.rotation
  );
  const ro_targetCoords = rotateCoords(
    un_targetCoords,
    targetCenterXY,
    targetNode.rotation
  );

  const distance = Math.abs(ro_targetCoords.y - ro_sourceCoords.y);
  const offset = distance * 0.5;

  const cp1 = { x: ro_sourceCoords.x + offset, y: ro_sourceCoords.y };
  const cp2 = { x: ro_targetCoords.x, y: ro_targetCoords.y + offset };

  const pathData = `M ${ro_sourceCoords.x} ${ro_sourceCoords.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${ro_targetCoords.x} ${ro_targetCoords.y}`;

  return (
    <>
      <path d={pathData} fill="none" stroke="black" />
    </>
  );
};

export default Edge;
