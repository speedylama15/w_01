import React from "react";

import useMouse from "../../stores/useMouse";

import "./Sidebar.css";

const Sidebar = () => {
  const set_mouseState = useMouse((state) => state.set_mouseState);

  const handleClick = () => {
    set_mouseState("ADD_SQUARE");
  };

  return (
    <div className="sidebar">
      <button onClick={handleClick}>Add Square</button>

      <button>Add Rounded Square</button>

      {/* can be come an ellipse */}
      <button>Add Circle</button>

      <button>Add Diamond</button>

      <button>Add Heart</button>

      <button>Add Cloud</button>

      <button>Add Chatbox</button>
    </div>
  );
};

export default Sidebar;
