import useApp from "../../../store/useApp";
import useResize from "../../../store/useResize";

import "./NodeResizer.css";

const getResizerCoords = (node, location) => {
  // take into account of rotation later
  const { position, dimension } = node;
  const { x, y } = position;
  const { width, height } = dimension;

  const data = {
    top: { x: 0, y: y },
    right: { x: x + width, y: 0 },
    bottom: { x: 0, y: y + height },
    left: { x: x, y: 0 },
    "top-left": { x, y },
    "top-right": { x: x + width, y },
    "bottom-left": { x: x + width, y: y + height },
    "bottom-right": { x, y: y + height },
  };

  return data[location];
};

const NodeResizer = ({ node, type, location }) => {
  const set_mouseState = useApp((state) => state.set_mouseState);
  const set_selectedNodesMap = useApp((state) => state.set_selectedNodesMap);

  const set_startResizeXY = useResize((state) => state.set_startResizeXY);
  const set_resizeDirection = useResize((state) => state.set_resizeDirection);

  const handleMouseDown = (e) => {
    e.stopPropagation();

    const coords = getResizerCoords(node, location);
    set_mouseState("NODE_RESIZE");
    set_startResizeXY(coords);
    set_resizeDirection(location);
    // a node is already selected
    // I need this because the selected node's is not getting updated
    set_selectedNodesMap({ [node.id]: node });

    document.body.style.userSelect = "none";
  };

  return (
    <div
      className="node-resizer"
      data-resizer-type={type}
      location={location}
      onMouseDown={handleMouseDown}
    />
  );
};

export default NodeResizer;
