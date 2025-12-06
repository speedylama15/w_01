import useMouse from "../../../stores/useMouse";
import useResize from "../../../stores/useResize";
import useSelection from "../../../stores/useSelection";
import useTrees from "../../../stores/useTrees";

import "./NodeResizer.css";

// fix: take into account of rotation later
const getResizerCoords = (node, location) => {
  const { position, dimension } = node;
  const { x, y } = position;
  const { width, height } = dimension;

  // fix: I am going to have to fix this
  const data = {
    top: { x: 0, y: y },
    right: { x: x + width, y: 0 },
    bottom: { x: 0, y: y + height },
    left: { x: x, y: 0 },
    "top-left": { x, y },
    "top-right": { x: x + width, y },
    "bottom-left": { x, y: y + height },
    "bottom-right": { x: x + width, y: y + height },
  };

  return data[location];
};

const NodeResizer = ({ node, location }) => {
  const set_nodesTree = useTrees((state) => state.set_nodesTree);

  const set_mouseState = useMouse((state) => state.set_mouseState);
  const set_singleSelectedNode = useSelection(
    (state) => state.set_singleSelectedNode
  );

  const set_resizeData = useResize((state) => state.set_resizeData);

  const handleMouseDown = (e) => {
    // local elements of a component need this
    e.stopPropagation();

    // DEBUG: erase this later
    set_nodesTree([]);

    document.body.style.userSelect = "none";

    set_mouseState("SINGLE_NODE_RESIZE");
    set_singleSelectedNode(node);

    // normally, I would not be able to set start coords because I need panOffsetCoords and scale
    // they will trigger unnecessary re-renders
    // But here, those are not needed
    set_resizeData({ startCoords: getResizerCoords(node, location), location });

    return;
  };

  return (
    <div
      className="node-resizer"
      data-resizer-location={location}
      onMouseDown={handleMouseDown}
    />
  );
};

export default NodeResizer;
