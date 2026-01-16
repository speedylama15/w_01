import { HashRouter, Routes, Route } from "react-router-dom";

import EditorProvider from "./editor/EditorProvider.jsx";
import HomePage from "./components/HomePage.jsx";
import EditorPage from "./pages/EditorPage/EditorPage.jsx";
import WhiteboardPage from "./pages/WhiteboardPage/WhiteboardPage.jsx";
import Navbar from "./components/Navbar/Navbar.jsx";
import TableDropdown from "./editor/components/TableDropdown/TableDropdown.jsx";

import "./editor/Editor.css";
import "./editor/nodes/Block.css";

import "./editor/nodes/Paragraph/Paragraph.css";

import "./editor/nodes/Headings/Heading1/Heading1.css";
import "./editor/nodes/Headings/Heading2/Heading2.css";
import "./editor/nodes/Headings/Heading3/Heading3.css";

import "./editor/nodes/Lists/BulletList/BulletList.css";
import "./editor/nodes/Lists/NumberedList/NumberedList.css";
import "./editor/nodes/Lists/Checklist/Checklist.css";

import "./editor/nodes/Blockquote/Blockquote.css";

import "./editor/nodes/Verses/Verse/Verse.css";
import "./editor/nodes/Verses/VerseWithCitation/VerseWithCitation.css";

import "./editor/nodes/Files/Image/Image.css";
import "./editor/nodes/Files/Audio/Audio.css";
import "./editor/nodes/Files/Video/Video.css";
import "./editor/nodes/Files/PDF/PDF.css";

import "./editor/nodes/Divider/Divider.css";

import "./editor/nodes/Table/Table.css";
import "./editor/nodes/Table/TableRow.css";
import "./editor/nodes/Table/TableHeader.css";
import "./editor/nodes/Table/TableCell.css";

function App() {
  return (
    <EditorProvider>
      <div className="t-page">
        <HashRouter>
          <Navbar />

          <Routes>
            <Route path="/" exact element={<HomePage />} />
            <Route path="/editor" exact element={<EditorPage />} />
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
