import { HashRouter, Routes, Route } from "react-router-dom";

import EditorProvider from "./editor/EditorProvider.jsx";
import EditorPage from "./pages/EditorPage/EditorPage.jsx";
import WhiteboardPage from "./pages/WhiteboardPage/WhiteboardPage.jsx";
import Navbar from "./components/Navbar/Navbar.jsx";

import {
  BlockHandle,
  BlockHandleDropdown,
  EditorBoxSelect,
} from "./editor/features";

import AddNodeMenu from "./editor/features/SlashCommand/AddNodeMenu.jsx";
import Portal from "./Portal.jsx";

function App() {
  return (
    <EditorProvider>
      {/* idea: I can change the className by fetching the url and changing it accordingly */}
      <div className="t-page">
        <HashRouter>
          <Navbar />

          <Routes>
            <Route path="/" exact element={<EditorPage />} />

            <Route path="/whiteboard" exact element={<WhiteboardPage />} />
          </Routes>
        </HashRouter>
      </div>

      <Portal />
    </EditorProvider>
  );
}

export default App;
