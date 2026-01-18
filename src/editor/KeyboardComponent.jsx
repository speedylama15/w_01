import { useEffect } from "react";
import { useCurrentEditor } from "@tiptap/react";

import { MultipleNodeSelection } from "./selections/MultipleNodeSelection";

const KeyboardComponent = () => {
  const editor = useCurrentEditor();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!editor) return;

      // idea: this will handle backspace when editor is NOT focused
      if (editor.isFocused) return;

      console.log("keydown", editor.isFocused);

      if (e.key === "Backspace") {
        const { selection } = editor.state;
      }
    };

    document.body.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor]);

  return <></>;
};

export default KeyboardComponent;
