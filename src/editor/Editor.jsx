import { useRef } from "react";
import { useCurrentEditor, EditorContent } from "@tiptap/react";

import BlockHandle from "./plugins/BlockHandle/BlockHandle.jsx";
import KeyboardComponent from "./KeyboardComponent.jsx";

const Editor = () => {
  const editor = useCurrentEditor();

  const editorRef = useRef();

  return (
    <div ref={editorRef} className="editor">
      <EditorContent editor={editor} className="editor-content" />

      <BlockHandle />
      <KeyboardComponent />
    </div>
  );
};

export default Editor;
