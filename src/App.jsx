import { HashRouter, Routes, Route } from "react-router-dom";

import EditorProvider from "./editor/EditorProvider.jsx";
import EditorPage from "./pages/EditorPage/EditorPage.jsx";
import WhiteboardPage from "./pages/WhiteboardPage/WhiteboardPage.jsx";
import Navbar from "./components/Navbar/Navbar.jsx";
import TableDropdown from "./editor/components/TableDropdown/TableDropdown.jsx";

function App() {
  return (
    <EditorProvider>
      <div className="t-page">
        <HashRouter>
          <Navbar />

          <Routes>
            <Route path="/" exact element={<EditorPage />} />

            <Route path="/whiteboard" exact element={<WhiteboardPage />} />
          </Routes>
        </HashRouter>
      </div>

      <div className="portal">
        <TableDropdown />
      </div>
    </EditorProvider>
  );
}

export default App;
