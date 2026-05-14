import { TextSelection } from "@tiptap/pm/state";
import { historyManager } from "./HistoryManager";
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

    // undo
    if (e.metaKey && e.key === "z" && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();

      const stack = historyManager.getUndoStack();

      if (stack.length === 0) return;

      let timeStart = null;
      let timeEnd = null;
      let lastBookmark = null;

      // reverse the array
      for (let j = stack.length - 1; j >= 0; j--) {
        const data = stack[j];
        const { step, time, bookmark } = data;

        if (timeEnd === null) {
          timeStart = time - 500;
          timeEnd = time;
        }

        const isInWindow = isInclusive(time, timeStart, timeEnd);

        if (isInWindow) {
          tr.step(step); // let undo step occur

          historyManager.popUndoStack();

          lastBookmark = bookmark;
        }
      }

      // fix: also the type of selection is necessary
      // todo: maybe I should store the type of selection in data when adding to stack
      // review: this works all of a sudden???
      const restoredSelection = lastBookmark.resolve(tr.doc);
      tr.setSelection(restoredSelection);

      tr.setMeta("undo", true);

      dispatch(tr);

      this.editor.view.focus();
    }

    // redo
    if (e.metaKey && e.shiftKey && e.key === "z") {
      e.preventDefault();
      e.stopPropagation();

      const stack = historyManager.getRedoStack();

      if (stack.length === 0) return;

      let timeStart = null;
      let timeEnd = null;
      let lastBookmark = null;

      // reverse the array
      for (let j = stack.length - 1; j >= 0; j--) {
        const data = stack[j];
        const { step, time, bookmark } = data;

        if (timeEnd === null) {
          timeStart = time - 500;
          timeEnd = time;
        }

        const isInWindow = isInclusive(time, timeStart, timeEnd);

        if (isInWindow) {
          tr.step(step);

          historyManager.popRedoStack();

          lastBookmark = bookmark;
        }
      }

      // fix: also the type of selection is necessary
      // todo: maybe I should store the type of selection in data when adding to stack
      // review: this works all of a sudden???
      const restoredSelection = lastBookmark.resolve(tr.doc);
      tr.setSelection(restoredSelection);

      tr.setMeta("redo", true);

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
