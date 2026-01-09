import { useEffect, useRef, useState } from "react";
import { useCurrentEditor } from "@tiptap/react";

import "./TableDropdown.css";

const TableDropdown = () => {
  const [dropdownData, setDropdownData] = useState({
    isOpen: false,
    rect: null,
    type: null,
  });

  const editor = useCurrentEditor();

  const dropdownRef = useRef();

  useEffect(() => {
    if (!editor) return;

    const handleEditorTransaction = ({ transaction }) => {
      const openTableDropdodwn = transaction.getMeta("open-table-dropdown");

      if (openTableDropdodwn) {
        const data = openTableDropdodwn;

        document.body.style.overflow = "hidden";

        // fix: change the name of the page in the future
        const editorPage = document.querySelector(".t-page");
        editorPage.inert = true;

        setDropdownData(data);
      }
    };

    const handleDocumentMouseDown = (e) => {
      if (!dropdownRef.current) return;

      const isContained = dropdownRef.current.contains(e.target);

      if (!isContained) {
        document.body.style.overflow = "visible";

        const editorPage = document.querySelector(".t-page");
        editorPage.inert = false;

        setDropdownData({ isOpen: false, rect: null, type: null });
      }
    };

    document.body.addEventListener("mousedown", handleDocumentMouseDown);
    editor.on("transaction", handleEditorTransaction);

    return () => {
      editor.off("transaction", handleEditorTransaction);
    };
  }, [editor]);

  return (
    <>
      {dropdownData.isOpen && (
        <div
          className="table-dropdown"
          style={{
            position: "absolute",
            top: `${dropdownData.rect.top}px`,
            left: `${dropdownData.rect.left + (dropdownData.type === "column" ? 25 : 10)}px`,
            zIndex: 10,
          }}
          ref={dropdownRef}
        >
          <button>Color</button>

          <button>Insert left/up</button>

          <button>Insert right/down</button>

          <button>Duplicate</button>

          <button>Clear contents</button>

          <button>Delete</button>
        </div>
      )}
    </>
  );
};

export default TableDropdown;
