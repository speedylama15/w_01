import { createStore } from "zustand";

const mainStore = createStore((set) => {
  return {
    operation: null, // later compile this into variables
    format: null, // "editor" || "whiteboard"
    mouseState: "IDLE", // "IDLE" || "DOWN" || "DRAG"

    setOperation: (operation) => set({ operation }),
    setFormat: (format) => set({ format }),
    setMouseState: (state) => set({ mouseState: state }),
  };
});

export default mainStore;
