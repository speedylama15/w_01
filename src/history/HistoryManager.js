// fix: do I have to add a way to destroy the instance?
class HistoryManager {
  editor = null;
  #undoStack = [];
  #redoStack = [];
  limit = 100; // fix: this needs to be taken into account

  constructor() {
    console.log("history manager");
  }

  getIsReady() {
    if (this.editor) return true;

    return false;
  }

  setEditor(editor) {
    this.editor = editor;
  }

  getUndoStack() {
    return this.#undoStack;
  }
  setUndoStack(arr) {
    this.#undoStack = arr;
  }
  addToUndoStack(data) {
    this.#undoStack.push(data);
  }
  popUndoStack() {
    this.#undoStack.pop();
  }

  getRedoStack() {
    return this.#redoStack;
  }
  setRedoStack(arr) {
    this.#redoStack = arr;
  }
  addToRedoStack(data) {
    this.#redoStack.push(data);
  }
  popRedoStack() {
    this.#redoStack.pop();
  }
  clearRedoStack() {
    this.#redoStack = [];
  }
}

export const historyManager = new HistoryManager();
