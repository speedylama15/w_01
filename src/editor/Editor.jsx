import { useRef } from "react";
import { useEditor, EditorContent, Content } from "@tiptap/react";

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
const json = {
  type: "doc",
  content: [
    {
      type: "heading3",
      attrs: {
        id: "b34cc4b1-3e03-485a-857a-9382855df88b",
        contentType: "heading3",
        indentLevel: 0,
        nodeType: "block",
      },
      content: [
        {
          type: "text",
          text: "December 17th 2025",
        },
      ],
    },
    {
      type: "paragraph",
      attrs: {
        id: "f0585ed6-4072-4e72-ab12-e4867cf8ec51",
        contentType: "heading3",
        indentLevel: 0,
        nodeType: "block",
      },
      content: [
        {
          type: "text",
          text: "Many things I need to work on.",
        },
      ],
    },
    {
      type: "paragraph",
      attrs: {
        id: "e5ef2ef5-3a10-427c-a559-6e97e7999253",
        contentType: "heading3",
        indentLevel: 0,
        nodeType: "block",
      },
      content: [
        {
          type: "text",
          text: "The UI is something that I need to work on.",
        },
      ],
    },
    {
      type: "paragraph",
      attrs: {
        id: "8d159177-4041-4c99-85ba-662a16b49fb0",
        contentType: "heading3",
        indentLevel: 0,
        nodeType: "block",
      },
      content: [
        {
          type: "text",
          text: "Tomorrow I will be going to church and I love going to ",
        },
        {
          type: "text",
          marks: [
            {
              type: "highlight",
            },
            {
              type: "bold",
            },
          ],
          text: "church",
        },
        {
          type: "text",
          text: ".",
        },
      ],
    },
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
          text: "Just sitting there and to relax.",
        },
      ],
    },
    {
      type: "paragraph",
      attrs: {
        id: "5d0a9a58-ed7b-49d4-b242-fb16d71c8712",
        contentType: "heading3",
        indentLevel: 0,
        nodeType: "block",
      },
      content: [
        {
          type: "text",
          text: "Well.",
        },
      ],
    },
    {
      type: "paragraph",
      attrs: {
        id: "e7539a77-adb7-46b7-b611-e30287c0caca",
        contentType: "heading3",
        indentLevel: 0,
        nodeType: "block",
      },
      content: [
        {
          type: "text",
          text: "We don't really sit but nevertheless. The relaxation that I feel when I am at the church is something that I look forward to. Also, I get to drive outside with my mother and spend time with her.",
        },
      ],
    },
  ],
};

const html = `<div data-id="43263902-1e19-4404-8f3d-6166384f4566" data-content-type="paragraph" data-indent-level="0" data-node-type="block" class="block block-paragraph"><div class="content content-paragraph"><paragraph>Enter functionality is off...</paragraph></div></div><div data-id="bf4b801e-0739-4d98-91f9-a81bd05908ce" data-content-type="paragraph" data-indent-level="0" data-node-type="block" class="block block-paragraph"><div class="content content-paragraph"><paragraph>I need to test performance</paragraph></div></div><div data-id="e71f33bd-8003-41da-bd9a-9b628a2fccca" data-content-type="paragraph" data-indent-level="0" data-node-type="block" class="block block-paragraph"><div class="content content-paragraph"><paragraph>There could be potentially 500 notes on a single whiteboard</paragraph></div></div><div data-id="b2bb499e-465b-4947-8228-af7262a9d954" data-content-type="paragraph" data-indent-level="0" data-node-type="block" class="block block-paragraph"><div class="content content-paragraph"><paragraph>Now that would tear down the performance of the Whiteboard</paragraph></div></div><div data-id="2d8806ea-c52a-4442-bf84-50958a48b531" data-content-type="paragraph" data-indent-level="0" data-node-type="block" class="block block-paragraph"><div class="content content-paragraph"><paragraph>But nevertheless</paragraph></div></div><div data-id="06910e0d-3671-459e-86bd-cd750fa1185e" data-content-type="paragraph" data-indent-level="0" data-node-type="block" class="block block-paragraph"><div class="content content-paragraph"><paragraph>I have to try it out</paragraph></div></div><div data-id="8b3ed814-70cd-40cf-a52a-0bed5c48c6b7" data-content-type="paragraph" data-indent-level="0" data-node-type="block" class="block block-paragraph"><div class="content content-paragraph"><paragraph>It just has to be a bit smoother</paragraph></div></div><div data-id="05a1bb51-a07a-4b23-9d5d-67de9616ee46" data-content-type="paragraph" data-indent-level="0" data-node-type="block" class="block block-paragraph"><div class="content content-paragraph"><paragraph>That is all</paragraph></div></div><div data-id="3696a26e-03be-4783-95b2-a5fd75987e3e" data-content-type="paragraph" data-indent-level="0" data-node-type="block" class="block block-paragraph"><div class="content content-paragraph"><paragraph><mark>Because performance is key</mark></paragraph></div></div><div data-id="4e00e447-9466-4349-8112-715ef9203aae" data-content-type="paragraph" data-indent-level="0" data-node-type="block" class="block block-paragraph"><div class="content content-paragraph"><paragraph><mark><strong>Efficiency is KEY</strong></mark></paragraph></div></div>`;

// const Editor = () => {
//   const editorRef = useRef();

//   const editor = useEditor({
//     content: json,
//     extensions: [
//       // REVIEW: node
//       Document,
//       Paragraph,
//       Heading1,
//       Heading2,
//       Heading3,
//       Text,

//       // REVIEW: mark
//       TextStyle,
//       Color,
//       Highlight,
//       Bold,
//       Italic,
//       Strike,
//       Superscript,
//       Underline,

//       // REVIEW: functionality
//       HardBreak,
//       // todo: make sure to provide an ID
//       UniqueID.configure({
//         types: [Paragraph.name, Heading1.name, Heading2.name, Heading3.name],
//       }),
//     ],

//     onCreate({ editor }) {
//       editor.view.dom.classList.remove("tiptap");
//       editor.view.dom.classList.add("editor-contenteditable");
//     },
//   });

//   return (
//     <div
//       ref={editorRef}
//       className="editor"
//       onClick={() => console.log(editor.getHTML())}
//     >
//       {/* DEBUG: maybe I should NOT allow users to alter contents of a node in whiteboard? */}
//       {/* DEBUG: I DO NEED TO BECAUSE THAT IS HOW PEOPLE ARE TYPE BASIC THINGS */}
//       {/* DEBUG: I also need to be able to center the contenteditable -> has to be the smallest possible size */}
//       <EditorContent editor={editor} className="editor-content" />
//     </div>
//   );
// };

// review: static version
const Editor = ({ ...others }) => {
  const editorRef = useRef();

  return (
    <div
      ref={editorRef}
      className="editor"
      dangerouslySetInnerHTML={{ __html: html }}
      {...others}
    />
  );
};

export default Editor;
