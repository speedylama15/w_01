import { useRef } from "react";
import { useCurrentEditor, EditorContent } from "@tiptap/react";

const Editor = () => {
  const editor = useCurrentEditor();

  const editorRef = useRef();

  return (
    <div ref={editorRef} className="editor">
      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
};

export default Editor;
