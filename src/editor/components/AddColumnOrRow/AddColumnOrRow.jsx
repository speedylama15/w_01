import { useCurrentEditor } from "@tiptap/react";

import "./AddColumnOrRow.css";

const AddColumnOrRow = () => {
  const editor = useCurrentEditor();

  return <div className="add-column-or-row">AddColumnOrRow</div>;
};

export default AddColumnOrRow;
