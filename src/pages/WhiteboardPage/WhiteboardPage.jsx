import { memo } from "react";

import Whiteboard from "../../whiteboard/Whiteboard.jsx";
import Sidebar from "./Sidebar.jsx";

import "./WhiteboardPage.css";

const WhiteboardPage = memo(() => {
  return (
    <div className="whiteboard-page">
      <Sidebar />

      <div className="main">
        <Whiteboard />
      </div>
    </div>
  );
});

export default WhiteboardPage;
