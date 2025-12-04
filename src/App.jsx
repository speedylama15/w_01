import { HashRouter, Routes, Route } from "react-router-dom";

import HomePage from "./components/HomePage.jsx";
import EditorPage from "./pages/EditorPage/EditorPage.jsx";
import WhiteboardPage from "./pages/WhiteboardPage/WhiteboardPage.jsx";
import SampleShapes from "./whiteboard/Canvas/SampleShapes.jsx";

import Navbar from "./components/Navbar/Navbar.jsx";

function App() {
  return (
    <div className="t-page">
      <HashRouter>
        <Navbar />

        <Routes>
          <Route path="/" exact element={<HomePage />} />
          <Route path="/editor" exact element={<EditorPage />} />
          <Route path="/whiteboard" exact element={<WhiteboardPage />} />
          <Route path="/shapes" exact element={<SampleShapes />} />
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;
