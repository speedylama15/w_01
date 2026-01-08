import { useEffect, useRef, useState } from "react";
import { useCurrentEditor } from "@tiptap/react";

import "./AddColumnButton.css";

const AddColumnButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState(null);

  const editor = useCurrentEditor();

  const tableRef = useRef();

  useEffect(() => {
    // editor, appendedTransactions
    const handleOnTransaction = ({ transaction }) => {
      const open = transaction.getMeta("open-add-column");

      if (open && !isOpen) {
        const { rect } = open;

        setIsOpen(true);
        setCoords(rect);
      }
    };

    const handleMouseMove = (e) => {
      if (!tableRef.current) return;

      //   const isContained = e.target.contains(tableRef.current);
      const isContained = tableRef.current.contains(e.target);

      const table = e.target.closest("table");
    };

    document.addEventListener("mousemove", handleMouseMove);
    editor.on("transaction", handleOnTransaction);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      editor.off("transaction", handleOnTransaction);
    };
  }, [editor, isOpen]);

  return (
    <>
      {isOpen && (
        <div
          className="add-column-button"
          style={{
            position: "absolute",
            top: `${coords.top + coords.height - 2}px`,
            left: `${coords.left}px`,
            width: `${coords.width}px`,
          }}
          onClick={() => {
            const { selection } = editor.state;

            editor.chain().focus().addColumnAfter().scrollIntoView().run();

            // return editor.commands.addRowAfter();
          }}
        >
          <button>ADD ROW</button>
        </div>
      )}
    </>
  );
};

export default AddColumnButton;
