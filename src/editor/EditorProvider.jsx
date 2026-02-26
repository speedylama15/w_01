import { useMemo } from "react";
import { useEditor, EditorContext } from "@tiptap/react";

import Text from "@tiptap/extension-text";
import Document from "./nodes/Document/Document";

import Paragraph from "./nodes/Paragraph/Paragraph";

import Heading1 from "./nodes/Headings/Heading1";
import Heading2 from "./nodes/Headings/Heading2";
import Heading3 from "./nodes/Headings/Heading3";

import BulletList from "./nodes/Lists/BulletList";
import NumberedList from "./nodes/Lists/NumberedList";
import Checklist from "./nodes/Lists/Checklist";

import Divider from "./nodes/Divider/Divider";

import Image from "./nodes/Files/Image";
import Audio from "./nodes/Files/Audio";
import Video from "./nodes/Files/Video";

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
import Link from "@tiptap/extension-link";
// mark

// functionality
import UniqueID from "@tiptap/extension-unique-id";
import HardBreak from "@tiptap/extension-hard-break";
// functionality

// shortcuts
import { KeyboardShortcuts } from "./shortcuts/KeyboardShortcuts";
// shortcuts

import { Plugins } from "./plugins/Plugins";

import "./css/Editor.css";
import "./css/Block.css";
import "./css/Content.css";
import "./css/Headings.css";
import "./css/BulletList.css";
import "./css/Checklist.css";
import "./css/NumberedList.css";
import "./css/Divider.css";
import "./css/Image.css";
import "./css/Audio.css";
import "./css/Video.css";

import "./plugins/Placeholder/Placeholder_Plugin.css";

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
      Divider,
      Image,
      Audio,
      Video,
      Table.configure({ resizable: false, cellMinWidth: 150 }),
      TableRow,
      TableHeader,
      TableCell,
      ParagraphItem,
      Text,

      // REVIEW: mark
      TextStyle,
      Color,
      Highlight,
      Bold,
      Italic,
      Strike,
      Underline,
      Link,

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
          Image.name,
          Audio.name,
          Video.name,
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
