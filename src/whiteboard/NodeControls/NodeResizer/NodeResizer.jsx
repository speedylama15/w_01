import useMouse from "../../../stores/useMouse";
import useResize from "../../../stores/useResize";
import useSelection from "../../../stores/useSelection";

import "./NodeResizer.css";

// todo: REMINDER -> NodeControls is NOT part of Node
const NodeResizer = ({ node, location }) => {
  const set_mouseState = useMouse((state) => state.set_mouseState);
  const set_singleSelectedNode = useSelection(
    (state) => state.set_singleSelectedNode
  );

  const set_singleResizeLocation = useResize(
    (state) => state.set_singleResizeLocation
  );

  const handleMouseDown = (e) => {
    // local elements of a component need this
    e.stopPropagation();

    document.body.style.userSelect = "none";

    set_mouseState("SINGLE_NODE_RESIZE");
    set_singleSelectedNode(node);
    set_singleResizeLocation(location);

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
