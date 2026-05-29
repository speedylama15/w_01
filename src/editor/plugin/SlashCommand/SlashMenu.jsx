import { DecorationSet } from "@tiptap/pm/view";
import { useEffect, useRef, memo } from "react";

// todo: inside here, set up a window level pointerdown for closing the window
// todo: add pointerdown for each button -> add e.stopPropagation

const SlashMenu = memo(({ editor, arr, text, index, to }) => {
  const nullPosRef = useRef(null);
  const menuRef = useRef(null);

  const result = arr.filter((data) => {
    return data.text.toLowerCase().includes(text.toLowerCase());
  });

  useEffect(() => {
    if (!editor) return;

    const down = (e) => {
      const { tr } = editor.view.state;
      const { dispatch } = editor.view;

      if (!menuRef.current) return;

      if (!menuRef.current.contains(e.target)) {
        dispatch(
          tr.setMeta("slashCommand", {
            isSlashActive: false,
            from: null,
            to: null,
            set: DecorationSet.empty,
          }),
        );
      }
    };

    // fix: need to think if I should add this to the window or document
    // events like this where it does one thing -> should it be at the window or document?
    document.addEventListener("pointerdown", down);

    return () => {
      document.removeEventListener("pointerdown", down);
    };
  }, [editor]);

  useEffect(() => {
    if (result.length === 0 && nullPosRef.current === null) {
      nullPosRef.current = to;
    }

    if (result.length > 0) {
      nullPosRef.current = null;
    }

    if (nullPosRef.current + 2 === to) {
      const { tr } = editor.view.state;
      const { dispatch } = editor.view;

      dispatch(
        tr.setMeta("slashCommand", {
          isSlashActive: false,
          from: null,
          to: null,
          set: DecorationSet.empty,
        }),
      );
    }
  }, [editor, to, result.length]);

  return (
    <div ref={menuRef}>
      {result.map((data, i) => {
        return (
          <button
            className={index === i ? "active" : "inactive"}
            key={`data-${i}`}
          >
            {data.content}
          </button>
        );
      })}
    </div>
  );
});

export default SlashMenu;
