import { useRef } from "react";
import { useCurrentEditor, EditorContent } from "@tiptap/react";

const EditorSection = () => {
  const editor = useCurrentEditor();

  const editorRef = useRef();

  return (
    <div className="editor-section">
      <div ref={editorRef} className="editor">
        <EditorContent editor={editor} className="editor-content" />
      </div>
    </div>
  );
};

export default EditorSection;
