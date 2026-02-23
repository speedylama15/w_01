import { useRef } from "react";
import { useCurrentEditor, EditorContent } from "@tiptap/react";

import EditorGap from "./components/EditorGap/EditorGap.jsx";

const Editor = () => {
  const editor = useCurrentEditor();

  const editorRef = useRef();

  return (
    <div ref={editorRef} className="editor">
      <EditorGap />

      <EditorContent editor={editor} className="editor-content" />

      <EditorGap />
    </div>
  );
};

export default Editor;
