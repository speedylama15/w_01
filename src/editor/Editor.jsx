import { useRef } from "react";
import { useCurrentEditor, EditorContent } from "@tiptap/react";

import BlockHandle from "./components/BlockHandle/BlockHandle.jsx";
import MarqueeSelectionBox from "./components/MarqueeSelectionBox/MarqueeSelectionBox.jsx";

const Editor = () => {
  const editor = useCurrentEditor();

  const editorRef = useRef();

  return (
    <div ref={editorRef} className="editor">
      <EditorContent editor={editor} className="editor-content" />

      <BlockHandle />
      <MarqueeSelectionBox />
    </div>
  );
};

export default Editor;
