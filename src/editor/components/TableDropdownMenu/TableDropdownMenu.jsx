import { useEffect, useRef, useState } from "react";

import { useCurrentEditor } from "@tiptap/react";

import "./TableDropdownMenu.css";

const TableDropdownMenu = () => {
  const editor = useCurrentEditor();

  const [dropdownData, setDropdownData] = useState({
    isOpen: false,
    buttonType: null,
    buttonIndex: null,
    buttonRect: null,
  });

  const tableDropdownRef = useRef();

  useEffect(() => {
    // editor, appendedTransactions
    const handleOnTransaction = ({ transaction }) => {
      const tableDropdown = transaction.getMeta("tableDropdown");

      if (tableDropdown) {
        document.body.style.overflow = "hidden";
        // fix: adding inert to the document body causes all events to come to a halt
        // fix: dropdown has to be interactable, therefore, I need to figure out where to
        // fix: place the Provider and editor instance and HTML structure
        // document.body.style.interactivity = "inert";
        setDropdownData(tableDropdown);
      }
    };

    const handleDocumentOnMousedown = (e) => {
      if (!tableDropdownRef.current) return;

      if (!tableDropdownRef.current.contains(e.target) && dropdownData.isOpen) {
        document.body.style.overflow = "";
        // document.body.style.interactivity = "auto";
        setDropdownData((prev) => ({ ...prev, isOpen: false }));
      }
    };

    document.body.addEventListener("mousedown", handleDocumentOnMousedown);
    editor.on("transaction", handleOnTransaction);

    return () => {
      document.body.removeEventListener("mousedown", handleDocumentOnMousedown);
      editor.off("transaction", handleOnTransaction);
    };
  }, [editor, dropdownData]);

  const handleClick = () => {
    // todo: I can use this
    console.log(editor.state.selection);
  };

  return (
    <>
      {dropdownData.isOpen ? (
        <div
          ref={tableDropdownRef}
          className="table-dropdown-menu"
          style={{
            top: `${dropdownData.buttonRect.top}px`,
            left: `${dropdownData.buttonRect.left + 24}px`,
          }}
        >
          <button onClick={handleClick}>Color</button>

          <button>Insert left/up</button>

          <button>Insert right/down</button>

          <button>Duplicate</button>

          <button>Clear contents</button>

          <button>Delete</button>
        </div>
      ) : null}
    </>
  );
};

export default TableDropdownMenu;
