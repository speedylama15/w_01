import { useEffect, useRef } from "react";
import { useCurrentEditor } from "@tiptap/react";
import { useStore } from "zustand";
import { TextSelection } from "@tiptap/pm/state";

import slashCommandStore from "./slashCommandStore";

import "./AddNodeMenu.css";

// todo: array of nodes
// todo: search functionality (use the library that I installed)
// todo: cancel operation and restore selection
// todo: I probably am going to need an index
// todo: arrow functionality

const AddNodeMenu = () => {
  const editor = useCurrentEditor();

  const { coords, pos, setOperation, setCoords, setPos } =
    useStore(slashCommandStore);

  const inputRef = useRef();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // maybe set this at the document level?
  const handleKeyDown = (e) => {
    const { tr } = editor.state;
    const { dispatch } = editor.view;

    if (e.key === "Escape") {
      const textSelection = TextSelection.create(tr.doc, pos);

      editor.view.focus();
      tr.setSelection(textSelection).scrollIntoView();

      dispatch(tr);

      setOperation(null);
      setCoords(null);
      setPos(null);

      return;
    }

    // Enter
  };

  const handleOnChange = () => {
    //
  };

  return (
    <div
      className="add-node-menu"
      style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
    >
      <input
        type="text"
        ref={inputRef}
        onKeyDown={handleKeyDown}
        onChange={handleOnChange}
      />

      <div className="buttons">
        <button>Paragraph</button>

        <button>Heading 1</button>
        <button>Heading 2</button>
        <button>Heading 3</button>

        <button>Table</button>
      </div>
    </div>
  );
};

export default AddNodeMenu;
