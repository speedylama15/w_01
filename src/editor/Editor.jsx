import { useRef } from "react";
import { useEditor, EditorContent, Content } from "@tiptap/react";

import useNodes from "../stores/useNodes";

import Text from "@tiptap/extension-text";
import Document from "./nodes/Document/Document";
import Paragraph from "./nodes/Paragraph/Paragraph";
import Heading1 from "./nodes/Heading1/Heading1";
import Heading2 from "./nodes/Heading2/Heading2";
import Heading3 from "./nodes/Heading3/Heading3";

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

// idea: use HTML instead
const html = `<div data-id="113262f9-7bd4-4690-8c4e-28ea3af9710b" data-content-type="heading1" data-indent-level="0" data-node-type="block" class="block block-heading1"><div class="content content-heading1"><heading1>Node 1</heading1></div></div><div data-id="22f29291-0280-4485-99e3-0d3d2d7c66f1" data-content-type="paragraph" data-indent-level="0" data-node-type="block" class="block block-paragraph"><div class="content content-paragraph"><paragraph>1. This is a numbered list&nbsp;</paragraph></div></div><div data-id="c9fa1cd7-7652-4333-89d4-ba8587d63de7" data-content-type="paragraph" data-indent-level="0" data-node-type="block" class="block block-paragraph"><div class="content content-paragraph"><paragraph>2. This is a numbered list. This is something that is something that is something in the world is something</paragraph></div></div><div data-id="3cfcb5b9-07a4-4a0a-a345-dcf4fc7ce0b1" data-content-type="paragraph" data-indent-level="0" data-node-type="block" class="block block-paragraph"><div class="content content-paragraph"><paragraph>3. Curious how <mark><strong>heaven</strong></mark> looks like</paragraph></div></div><div data-id="1779bfa2-8197-48da-b234-596903870931" data-content-type="paragraph" data-indent-level="0" data-node-type="block" class="block block-paragraph"><div class="content content-paragraph"><paragraph></paragraph></div></div><div data-id="ed4980bc-74a6-4cbb-ac19-5890eb500c3c" data-content-type="heading2" data-indent-level="0" data-node-type="block" class="block block-heading2"><div class="content content-heading2"><heading2>This</heading2></div></div><div data-id="e58fca4a-15eb-4d72-b037-c24e9324aae4" data-content-type="heading2" data-indent-level="0" data-node-type="block" class="block block-paragraph"><div class="content content-paragraph"><paragraph>1. <mark><strong>This is a numbered list&nbsp;</strong></mark></paragraph></div></div><div data-id="02777a53-b6c0-424c-9344-cc60fde06d48" data-content-type="paragraph" data-indent-level="0" data-node-type="block" class="block block-paragraph"><div class="content content-paragraph"><paragraph>2. This is a numbered list. This is something that is something that is something in the world is something</paragraph></div></div><div data-id="4053d552-5a0b-45fc-a9ce-72f2315c9775" data-content-type="paragraph" data-indent-level="0" data-node-type="block" class="block block-paragraph"><div class="content content-paragraph"><paragraph>3. Curious how <mark><strong>heaven</strong></mark> looks like</paragraph></div></div><div data-id="bab4717c-9bb2-4c0b-a849-7deb86cb7416" data-content-type="paragraph" data-indent-level="0" data-node-type="block" class="block block-paragraph"><div class="content content-paragraph"><paragraph></paragraph></div></div><div data-id="f9ccb2e8-aae0-4a63-9850-a610930d75f0" data-content-type="heading2" data-indent-level="0" data-node-type="block" class="block block-heading2"><div class="content content-heading2"><heading2>This</heading2></div></div><div data-id="a6096742-aade-4b5d-aa27-6385e455287c" data-content-type="paragraph" data-indent-level="0" data-node-type="block" class="block block-paragraph"><div class="content content-paragraph"><paragraph>This is a numbered list. <strong><em><u>This is something that is something that is something in the world is something</u></em></strong></paragraph></div></div><div data-id="06f93c4d-e102-48ef-80b7-5e05da7c3b2b" data-content-type="paragraph" data-indent-level="0" data-node-type="block" class="block block-paragraph"><div class="content content-paragraph"><paragraph></paragraph></div></div><div data-id="a9c1bf5a-690c-4691-83a8-e4dc660fd0a3" data-content-type="paragraph" data-indent-level="0" data-node-type="block" class="block block-paragraph"><div class="content content-paragraph"><paragraph>Curious how <mark><strong>heaven</strong></mark> looks like</paragraph></div></div>`;

const Editor = ({ node, ...others }) => {
  const editorRef = useRef();

  const set_node = useNodes((state) => state.set_node);

  const editor = useEditor({
    content: html,
    extensions: [
      // REVIEW: node
      Document,
      Paragraph,
      Heading1,
      Heading2,
      Heading3,
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
        types: [Paragraph.name, Heading1.name, Heading2.name, Heading3.name],
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
      {...others}
      onKeyDown={() => {
        const nNode = { ...node };
        nNode.dimension.height = editor.view.dom.scrollHeight + 16 * 2;
        set_node({ ...nNode });
      }}
    >
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
