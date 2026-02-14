import { useEffect, useRef, useState } from "react";
import Fuse from "fuse.js";

import "./NodeMenu.css";

const items = [
  { name: "Paragraph", type: "paragraph" },
  { name: "Bullet List", type: "bulletList" },
  { name: "Numbered List", type: "numberedList" },
  { name: "Checklist", type: "checklist" },
  { name: "Heading 1", type: "heading1", level: 1 },
  { name: "Heading 2", type: "heading2", level: 2 },
  { name: "Heading 3", type: "heading3", level: 3 },
];

const NodeMenu = (props) => {
  const [nodes, setNodes] = useState(items);

  const menuRef = useRef();
  const inputRef = useRef();
  const initRef = useRef(true);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        const { editor } = props;

        editor
          .chain()
          .focus()
          .setMeta("close-node_menu", {
            isActive: false,
          })
          .run();
      }
    };

    // ensure that this occurs only once
    if (initRef.current) {
      document.addEventListener("click", handleClick);
      initRef.current = false;
    }

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [props]);

  useEffect(() => {
    if (inputRef.current) {
      queueMicrotask(() => {
        inputRef.current?.focus();
      });
    }
  }, [props]);

  const handleChange = (e) => {
    // todo: need to handle cases when todo list is typed
    const search = e.target.value.toLowerCase();

    if (search === "") {
      setNodes(items);

      return;
    }

    const fuse = new Fuse(items, {
      keys: ["name"],
      threshold: 0.3, // 0 = exact match, 1 = match anything
    });

    const results = fuse
      .search(search)
      .sort((a, b) => a.refIndex - b.refIndex)
      .map((result) => result.item);

    setNodes(results);
  };

  const handleButtonClick = (e, node) => {
    const { editor } = props;
    const { selection } = editor.state;

    const newNode = editor.state.schema.nodes[node.type].create({});

    // fix: this replaces instead of adding...
    editor.chain().focus().insertContentAt(selection.to, newNode).run();
  };

  return (
    <div className="node-menu" ref={menuRef}>
      <input
        type="text"
        placeholder="Paragraph..."
        ref={inputRef}
        onChange={handleChange}
      />

      {nodes.map((node, index) => (
        <button key={index} onClick={(e) => handleButtonClick(e, node, index)}>
          {node.name}
        </button>
      ))}
    </div>
  );
};

export default NodeMenu;
