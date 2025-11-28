import Whiteboard from "../../whiteboard/Whiteboard.jsx";

import "./WhiteboardPage.css";

const WhiteboardPage = () => {
  return (
    <div className="whiteboard-page">
      <div className="sidebar"></div>

      <div className="main">
        <Whiteboard />
      </div>
    </div>
  );
};

export default WhiteboardPage;
