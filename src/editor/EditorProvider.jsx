import { useEffect, useMemo, useRef } from "react";
import { useEditor, EditorContext } from "@tiptap/react";
import { TextSelection } from "@tiptap/pm/state";

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
import TableItem from "./nodes/Table/TableItem";

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
import { HandleTransaction, MyPlugins } from "./extension";
// functionality

// shortcuts
import { KeyboardShortcuts } from "./keys/KeyboardShortcuts";
import ArrowUp from "./keys/Arrows/ArrowUp";
import ArrowDown from "./keys/Arrows/ArrowDown";
import ArrowRight from "./keys/Arrows/ArrowRight";
import ArrowLeft from "./keys/Arrows/ArrowLeft";
// shortcuts

import { historyManager } from "../managers/HistoryManager";
import { keyManager } from "../managers/KeyManager";

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
import "./css/Table.css";
import "./css/CellSelecting.css";
import "./plugin/placeholder/placeholder.css";
import "./plugin/TableResizing/TableResizing.css";
import "./plugin/TableReordering/TableReordering.css";
import "./plugin/slashCommand/SlashMenu.css";
import "./plugin/toolbarMenu/ToolbarMenu.css";

import "./css/selection/selection.css";

const EditorProvider = ({ children }) => {
  const prevSelection = useRef(null);

  const editor = useEditor({
    // fix: after deleting the data in local storage, I got an error...
    // fix: may have to map the selection
    // fix: history needs to ignore certain doc changing tr especially ones with composition that is greater than 0
    // todo: make a list of conditions that History should ignore
    onTransaction(props) {
      const { editor, transaction, appendedTransactions } = props;
      const { selection } = editor.state;

      const time = transaction.time;
      const docChanged = transaction.docChanged;

      const undo = transaction.getMeta("undo");
      const redo = transaction.getMeta("redo");

      const steps = transaction.steps;

      // user is taking action
      if (!undo && !redo && docChanged && steps.length > 0) {
        const bookmark = prevSelection.current.getBookmark();

        steps.forEach((step, i) => {
          const iStep = step.invert(transaction.docs[i]);

          historyManager.addToUndoStack({
            time,
            step: iStep,
            bookmark,
          });
        });

        if (appendedTransactions.length > 0) {
          appendedTransactions.forEach((tr) => {
            const steps = tr.steps;

            steps.forEach((step, i) => {
              const iStep = step.invert(tr.docs[i]);

              historyManager.addToUndoStack({
                time,
                step: iStep,
                bookmark,
              });
            });
          });
        }

        // clear the redo stack here
        historyManager.clearRedoStack();
      }

      if (undo && docChanged && steps.length > 0) {
        const bookmark = prevSelection.current.getBookmark();

        steps.forEach((step, i) => {
          const iStep = step.invert(transaction.docs[i]);

          historyManager.addToRedoStack({
            time,
            step: iStep,
            bookmark,
          });
        });

        if (appendedTransactions.length > 0) {
          appendedTransactions.forEach((tr) => {
            const steps = tr.steps;

            steps.forEach((step, i) => {
              const iStep = step.invert(tr.docs[i]);

              historyManager.addToRedoStack({
                time,
                step: iStep,
                bookmark,
              });
            });
          });
        }
      }

      if (redo && docChanged && steps.length > 0) {
        const bookmark = prevSelection.current.getBookmark();

        steps.forEach((step, i) => {
          const iStep = step.invert(transaction.docs[i]);

          historyManager.addToUndoStack({
            time,
            step: iStep,
            bookmark,
          });
        });

        if (appendedTransactions.length > 0) {
          appendedTransactions.forEach((tr) => {
            const steps = tr.steps;

            steps.forEach((step, i) => {
              const iStep = step.invert(tr.docs[i]);

              historyManager.addToUndoStack({
                time,
                step: iStep,
                bookmark,
              });
            });
          });
        }
      }

      // todo
      prevSelection.current = selection;
    },

    onCreate({ editor }) {
      editor.view.dom.classList.remove("tiptap");
      editor.view.dom.classList.add("editor-contenteditable");
    },

    onUpdate({ editor }) {
      localStorage.setItem("editor", JSON.stringify(editor.getJSON()));
    },

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
      TableItem,
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

      KeyboardShortcuts,
      ArrowUp,
      ArrowDown,
      ArrowRight,
      ArrowLeft,

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

      // fix: enable this later
      // HandleTransaction,
      MyPlugins,
    ],

    editorProps: {
      attributes: {
        /* review: solution */
        // I forgot what this was for...
        style: "overflow-wrap: anywhere;",
      },
    },
  });

  const memoizedEditor = useMemo(() => {
    return editor;
  }, [editor]);

  console.log("EditorProvider"); // fix: checking how often EditorProvider gets re-rendered

  useEffect(() => {
    if (editor) {
      historyManager.setEditor(editor);
      keyManager.setEditor(editor);
    }

    return () => {
      keyManager.destroy();
    };
  }, [editor]);

  return (
    <EditorContext.Provider value={memoizedEditor}>
      {children}
    </EditorContext.Provider>
  );
};

export default EditorProvider;
