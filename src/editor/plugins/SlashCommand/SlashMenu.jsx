import { DecorationSet } from "@tiptap/pm/view";
import { useEffect, useRef } from "react";

// todo: I forgot what the library is, but there is one that allows me find entries with similarities as an option?
// todo: sharpen this...
const arr = [
  { text: "paragraph", content: "Paragraph" },
  { text: "heading1", content: "Heading 1" },
  { text: "heading2", content: "Heading 2" },
  { text: "heading3", content: "Heading 3" },
  // idea: I can make text aka the search text, an array like ["bulletList", "todoList"]
  { text: "bulletList", content: "Bullet List" },
  { text: "numberedList", content: "Numbered List" },
  { text: "checklist", content: "Checklist" },
];

const SlashMenu = ({ editor, text, to }) => {
  const noResultPosRef = useRef(null);

  const filtered = arr.filter((data) => {
    return data.text.toLowerCase().includes(text.toLowerCase());
  });

  useEffect(() => {
    if (filtered.length === 0) {
      if (noResultPosRef.current === null) {
        noResultPosRef.current = to;
      }

      // fix: +2 or +3?
      if (to === noResultPosRef.current + 3) {
        noResultPosRef.current = null;

        const { tr } = editor.view.state;
        const { dispatch } = editor.view;

        tr.setMeta("slashCommand", {
          isSlashActive: false,
          from: null,
          to: null,
          set: DecorationSet.empty,
        });

        dispatch(tr);

        return;
      }
    }
  }, [editor, to, filtered.length]);

  return (
    <>
      {filtered.map((data, i) => {
        return <button key={`data-${i}`}>{data.content}</button>;
      })}
    </>
  );
};

export default SlashMenu;
