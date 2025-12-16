import { useRef } from "react";
import { useEditor, EditorContent, Content } from "@tiptap/react";

import Text from "@tiptap/extension-text";
import Document from "./nodes/Document/Document";
import Paragraph from "./nodes/Paragraph/Paragraph";
import Heading1 from "./nodes/Heading1/Heading1";
import Heading2 from "./nodes/Heading2/Heading2";
import Heading3 from "./nodes/Heading3/Heading3";
import BulletList from "./nodes/BulletList/BulletList";
import NumberedList from "./nodes/NumberedList/NumberedList";

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
import "./nodes/Heading1/Heading1.css";
import "./nodes/Heading2/Heading2.css";
import "./nodes/Heading3/Heading3.css";
import "./nodes/BulletList/BulletList.css";
import "./nodes/NumberedList/NumberedList.css";
import "./nodes/Block.css";

// idea: use HTML instead
const json = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      attrs: {
        id: "1487cbd4-b03b-4c9b-a766-cfca355cd5e3",
        contentType: "heading3",
        indentLevel: 0,
        nodeType: "block",
      },
      content: [
        {
          type: "text",
          text: "Lord Jesus Christ, Son of God, have mercy on me, a sinner",
        },
      ],
    },
  ],
};

const Editor = () => {
  const editorRef = useRef();

  const editor = useEditor({
    content: json,
    extensions: [
      // REVIEW: node
      Document,
      Paragraph,
      Heading1,
      Heading2,
      Heading3,
      BulletList,
      NumberedList,
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
      onClick={() => console.log(editor.getHTML())}
    >
      {/* DEBUG: maybe I should NOT allow users to alter contents of a node in whiteboard? */}
      {/* DEBUG: I DO NEED TO BECAUSE THAT IS HOW PEOPLE ARE TYPE BASIC THINGS */}
      {/* DEBUG: I also need to be able to center the contenteditable -> has to be the smallest possible size */}
      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
};

// review: static version
// const Editor = ({ ...others }) => {
//   const editorRef = useRef();

//   return (
//     <div
//       ref={editorRef}
//       className="editor"
//       dangerouslySetInnerHTML={{ __html: html }}
//       {...others}
//     />
//   );
// };

export default Editor;
