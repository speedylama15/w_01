import { useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";

import Text from "@tiptap/extension-text";
import Document from "./nodes/Document/Document";
import Paragraph from "./nodes/Paragraph/Paragraph";
import Heading1 from "./nodes/Headings/Heading1/Heading1";
import Heading2 from "./nodes/Headings/Heading2/Heading2";
import Heading3 from "./nodes/Headings/Heading3/Heading3";
import BulletList from "./nodes/BulletList/BulletList";
import NumberedList from "./nodes/NumberedList/NumberedList";
import Checklist from "./nodes/Checklist/Checklist";

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
import "./nodes/Block.css";

import "./nodes/Paragraph/Paragraph.css";

import "./nodes/Headings/Heading1/Heading1.css";
import "./nodes/Headings/Heading2/Heading2.css";
import "./nodes/Headings/Heading3/Heading3.css";

import "./nodes/BulletList/BulletList.css";
import "./nodes/NumberedList/NumberedList.css";
import "./nodes/Checklist/Checklist.css";

const Editor = () => {
  const editorRef = useRef();

  const editor = useEditor({
    content: "",
    extensions: [
      // REVIEW: node
      Document,
      Paragraph,
      Heading1,
      Heading2,
      Heading3,
      BulletList,
      NumberedList,
      Checklist,
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
      // todo: make sure to provide an ID
      UniqueID.configure({
        types: [
          Paragraph.name,
          Heading1.name,
          Heading2.name,
          Heading3.name,
          BulletList.name,
          NumberedList.name,
          Checklist.name,
        ],
      }),
    ],

    onCreate({ editor }) {
      editor.view.dom.classList.remove("tiptap");
      editor.view.dom.classList.add("editor-contenteditable");
    },
  });

  return (
    <div
      ref={editorRef}
      className="editor"
      // fix
      // fix: also need to be able to focus onto the editor
      onClick={() => console.log(editor.getJSON())}
    >
      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
};

export default Editor;
