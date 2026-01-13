import { useEffect, useState } from "react";
import { useCurrentEditor } from "@tiptap/react";

import "./AddColumnOrRow.css";

const AddColumnOrRow = () => {
  const [isInteracted, setIsInteracted] = useState(false);
  const [data, setData] = useState({ isOpen: false, rect: null });

  const editor = useCurrentEditor();

  useEffect(() => {
    if (!editor) return;

    const handleTr = ({ transaction }) => {
      const open = transaction.getMeta("open-add-column-or-row");
      const hide = transaction.getMeta("hide-add-column-or-row");

      if (!data.isOpen && open) {
        setData({ isOpen: true, rect: open.rect });
      }

      if (hide && !isInteracted) {
        setData({ isOpen: false, rect: null });
      }
    };

    editor.on("transaction", handleTr);
  }, [editor, data.isOpen, isInteracted]);

  return (
    <>
      {data.isOpen && (
        <div
          onMouseMove={() => setIsInteracted(true)}
          className="add-column-or-row"
          style={{
            top: `${data.rect.top + data.rect.height}px`,
            left: `${data.rect.left}px`,
            width: data.rect.width - 8,
            height: "3px",
            // fix: this is iffy, hard-coded
            transform: `translate(4px, -5px)`,
          }}
        >
          <button />
        </div>
      )}
    </>
  );
};

export default AddColumnOrRow;
