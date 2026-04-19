import { useNavigate } from "react-router-dom";
import { useCurrentEditor } from "@tiptap/react";

import { getTableMap } from "../../editor/features/utils/getTableMap";

import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const editor = useCurrentEditor();

  const handleToggleColumnClick = () => {
    if (!editor) return;

    const docSize = editor.state.doc.content.size;

    editor.state.doc.nodesBetween(0, docSize, (node, pos) => {
      if (node.attrs.nodeType === "block") {
        if (node.type.name === "table") {
          const isHeaderRow = node.attrs.isHeaderRow;
          const isHeaderColumn = node.attrs.isHeaderColumn;

          const map = getTableMap(node, pos);

          const { grid } = map;

          const cells = grid.map((row) => row[0]);

          const { view, state } = editor;
          const { tr } = view.state;
          const { dispatch } = view;
          const { schema } = state;

          cells.forEach((cell, i) => {
            const { node, pos } = cell;

            if (i === 0 && isHeaderRow) return;

            tr.setNodeMarkup(
              pos,
              isHeaderColumn
                ? schema.nodes.tableCell
                : schema.nodes.tableHeader,
              { ...node.attrs },
            );
          });

          tr.setNodeAttribute(pos, "isHeaderColumn", !isHeaderColumn);

          dispatch(tr);
        }

        return false;
      }
    });
  };

  const handleToggleRowClick = () => {
    if (!editor) return;

    const docSize = editor.state.doc.content.size;

    editor.state.doc.nodesBetween(0, docSize, (node, pos) => {
      if (node.attrs.nodeType === "block") {
        if (node.type.name === "table") {
          const isHeaderRow = node.attrs.isHeaderRow;
          const isHeaderColumn = node.attrs.isHeaderColumn;

          const map = getTableMap(node, pos);

          const { grid } = map;

          const cells = grid[0];

          const { view, state } = editor;
          const { tr } = view.state;
          const { dispatch } = view;
          const { schema } = state;

          cells.forEach((cell, i) => {
            const { node, pos } = cell;

            if (i === 0 && isHeaderColumn) return;

            tr.setNodeMarkup(
              pos,
              isHeaderRow ? schema.nodes.tableCell : schema.nodes.tableHeader,
              { ...node.attrs },
            );
          });

          tr.setNodeAttribute(pos, "isHeaderRow", !isHeaderRow);

          dispatch(tr);
        }

        return false;
      }
    });
  };

  return (
    <nav className="navbar">
      <h1>w_01</h1>

      <div className="navbar_buttons">
        <button onClick={() => navigate(-1)}>Go Back</button>
        <button onClick={() => navigate("/editor")}>Editor</button>
        <button onClick={() => navigate("/whiteboard")}>Whiteboard</button>
        <button onClick={() => navigate("/shapes")}>Shapes</button>

        <button onClick={handleToggleColumnClick}>Toggle Column</button>

        <button onClick={handleToggleRowClick}>Toggle Row</button>
      </div>
    </nav>
  );
};

export default Navbar;
