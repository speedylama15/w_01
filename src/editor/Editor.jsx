import { useRef } from "react";
import { useCurrentEditor, EditorContent } from "@tiptap/react";

import BlockHandle from "./components/BlockHandle/BlockHandle.jsx";

const Editor = () => {
  const editor = useCurrentEditor();

  const editorRef = useRef();

  return (
    <div ref={editorRef} className="editor">
      <EditorContent editor={editor} className="editor-content" />

      <BlockHandle />
      {/* <FlexibleSelectionBox /> */}
    </div>
  );
};

export default Editor;
