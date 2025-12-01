import { useEditor, EditorContent } from "@tiptap/react";

import Text from "@tiptap/extension-text";
import Document from "./nodes/Document/Document";
import Paragraph from "./nodes/Paragraph/Paragraph";

// mark
import { TextStyle, Color } from "@tiptap/extension-text-style";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Highlight from "@tiptap/extension-highlight";
import Strike from "@tiptap/extension-strike";
import Superscript from "@tiptap/extension-superscript";
import Underline from "@tiptap/extension-underline";

// mark

// functionality
import UniqueID from "@tiptap/extension-unique-id";
import HardBreak from "@tiptap/extension-hard-break";
// functionality

import "./Editor.css";

const Editor = () => {
  const editor = useEditor({
    content: "",
    extensions: [
      // REVIEW: node
      Document,
      Paragraph,
      Text,

      // REVIEW: mark
      TextStyle,
      Color,
      Highlight,
      Bold,
      Italic,
      Strike,
      Superscript,
      Underline,

      // REVIEW: functionality
      HardBreak,
      UniqueID.configure({
        types: [],
      }),
    ],

    onCreate({ editor }) {
      editor.view.dom.classList.remove("tiptap", "ProseMirror");
      editor.view.dom.classList.add("editor-contenteditable");
    },
  });

  return (
    <div className="editor">
      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
};

export default Editor;
