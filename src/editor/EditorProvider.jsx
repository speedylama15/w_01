import { useMemo } from "react";
import { useEditor, EditorContext } from "@tiptap/react";

import Text from "@tiptap/extension-text";
import Document from "./nodes/Document/Document";
import Paragraph from "./nodes/Paragraph/Paragraph";
import Heading1 from "./nodes/Headings/Heading1/Heading1";
import Heading2 from "./nodes/Headings/Heading2/Heading2";
import Heading3 from "./nodes/Headings/Heading3/Heading3";
import BulletList from "./nodes/Lists/BulletList/BulletList";
import NumberedList from "./nodes/Lists/NumberedList/NumberedList";
import Checklist from "./nodes/Lists/Checklist/Checklist";
import Blockquote from "./nodes/Blockquote/Blockquote";
import Verse from "./nodes/Verses/Verse/Verse";
import VerseWithCitation from "./nodes/Verses/VerseWithCitation/VerseWithCitation";
import Image from "./nodes/Files/Image/Image";
import Audio from "./nodes/Files/Audio/Audio";
import Video from "./nodes/Files/Video/Video";
import PDF from "./nodes/Files/PDF/PDF";
import Divider from "./nodes/Divider/Divider";
import Table from "./nodes/Table/Table";
import TableRow from "./nodes/Table/TableRow";
import TableHeader from "./nodes/Table/TableHeader";
import TableCell from "./nodes/Table/TableCell";
import ParagraphItem from "./nodes/Table/content/ParagraphItem";

// mark
import { TextStyle, Color } from "@tiptap/extension-text-style";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Highlight from "@tiptap/extension-highlight";
import Strike from "@tiptap/extension-strike";
import Underline from "@tiptap/extension-underline";
// mark

// functionality
import UniqueID from "@tiptap/extension-unique-id";
import HardBreak from "@tiptap/extension-hard-break";
// functionality

// shortcuts
import { KeyboardShortcuts } from "./shortcuts/KeyboardShortcuts";
// shortcuts

import { Plugins } from "./plugins/Plugins";

import "./Editor.css";
import "./nodes/Block.css";

import "./nodes/Paragraph/Paragraph.css";

import "./nodes/Headings/Heading1/Heading1.css";
import "./nodes/Headings/Heading2/Heading2.css";
import "./nodes/Headings/Heading3/Heading3.css";

import "./nodes/Lists/BulletList/BulletList.css";
import "./nodes/Lists/NumberedList/NumberedList.css";
import "./nodes/Lists/Checklist/Checklist.css";

import "./nodes/Blockquote/Blockquote.css";

import "./nodes/Verses/Verse/Verse.css";
import "./nodes/Verses/VerseWithCitation/VerseWithCitation.css";

import "./nodes/Files/Image/Image.css";
import "./nodes/Files/Audio/Audio.css";
import "./nodes/Files/Video/Video.css";
import "./nodes/Files/PDF/PDF.css";

import "./nodes/Divider/Divider.css";

import "./nodes/Table/Table.css";
import "./nodes/Table/TableRow.css";
import "./nodes/Table/TableHeader.css";
import "./nodes/Table/TableCell.css";

const EditorProvider = ({ children }) => {
  const editor = useEditor({
    content: JSON.parse(localStorage.getItem("editor")) || "",
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
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
      Blockquote,
      Verse,
      VerseWithCitation,
      Image,
      Audio,
      Video,
      PDF,
      Divider,
      Table.configure({ resizable: true, cellMinWidth: 150 }),
      TableRow,
      TableHeader,
      TableCell,
      ParagraphItem,
      Text,

      // fix
      KeyboardShortcuts,
      // fix

      // REVIEW: mark
      TextStyle,
      Color,
      Highlight,
      Bold,
      Italic,
      Strike,
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
          Blockquote.name,
          Verse.name,
          VerseWithCitation.name,
          Image.name,
          Audio.name,
          Video.name,
          PDF.name,
          Divider.name,
          Table.name,
        ],
      }),

      // review: plugin
      Plugins,
    ],

    editorProps: {
      attributes: {
        /* review: solution */
        style: "overflow-wrap: anywhere;",
      },
    },

    onCreate({ editor }) {
      editor.view.dom.classList.remove("tiptap");
      editor.view.dom.classList.add("editor-contenteditable");
    },

    onUpdate({ editor }) {
      localStorage.setItem("editor", JSON.stringify(editor.getJSON()));
    },
  });

  const memoizedEditor = useMemo(() => {
    return editor;
  }, [editor]);

  return (
    <EditorContext.Provider value={memoizedEditor}>
      {children}
    </EditorContext.Provider>
  );
};

export default EditorProvider;
