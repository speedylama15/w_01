import { TextSelection } from "@tiptap/pm/state";
import { historyManager } from "../history/HistoryManager";
import { isInclusive } from "../utils";

class KeyManager {
  editor = null;

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    window.addEventListener("keydown", this.handleKeyDown, { capture: true });
  }

  handleKeyDown(e) {
    const { tr } = this.editor.view.state;
    const { dispatch } = this.editor.view;

    if (e.metaKey && e.key === "z" && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();

      const stack = historyManager.getUndoStack();

      if (stack.length === 0) return;

      let undoStack = [];
      let timeStart = null;
      let timeEnd = null;
      let lastBookmark = null;

      // reverse the array
      for (let i = stack.length - 1; i >= 0; i--) {
        const data = stack[i];
        const { step, time, bookmark, map } = data;

        if (timeEnd === null) {
          timeStart = time - 500;
          timeEnd = time;
        }

        const isInWindow = isInclusive(time, timeStart, timeEnd);

        if (isInWindow) {
          tr.step(step);

          const j = stack.length - 1 - i;
          // need to inverse the index here
          const reinvertedStep = tr.steps[j].invert(tr.docs[j]);

          lastBookmark = bookmark;

          historyManager.addToRedoStack({
            step: reinvertedStep,
            time,
            bookmark,
            map,
          });
        }

        if (!isInWindow) {
          undoStack[i] = { step, time, bookmark, map };
        }
      }

      console.log("undo bookmark", lastBookmark); // fix
      const restoredSelection = lastBookmark.resolve(tr.doc);

      historyManager.setUndoStack(undoStack);

      tr.setSelection(restoredSelection);
      tr.setMeta("addToHistory", false);

      dispatch(tr);

      this.editor.view.focus();
    }

    // review: redo
    if (e.metaKey && e.shiftKey && e.key === "z") {
      e.preventDefault();
      e.stopPropagation();

      const stack = historyManager.getRedoStack();

      if (stack.length === 0) return;

      let timeStart = null;
      let timeEnd = null;
      let lastBookmark = null;

      // reverse the array
      for (let i = stack.length - 1; i >= 0; i--) {
        const { step, time, bookmark } = stack[i];

        if (timeEnd === null) {
          // review: this had to change
          timeStart = time;
          timeEnd = time + 500;
        }

        const isInWindow = isInclusive(time, timeStart, timeEnd);

        if (isInWindow) {
          tr.step(step);

          lastBookmark = bookmark;

          historyManager.popRedoStack();
        }
      }

      // fix
      // const restoredSelection = lastBookmark.resolve(tr.doc);
      // tr.setSelection(restoredSelection);
      const mappedSelection = TextSelection.create(
        tr.doc,
        tr.mapping.map(lastBookmark.anchor),
        tr.mapping.map(lastBookmark.head),
      );
      tr.setSelection(mappedSelection);
      // fix

      dispatch(tr);

      this.editor.view.focus();
    }
  }

  getIsReady() {
    if (this.editor) return true;

    return false;
  }

  setEditor(editor) {
    this.editor = editor;
  }

  destroy() {
    window.removeEventListener("keydown", this.handleKeyDown);
  }
}

export const keyManager = new KeyManager();
