import { createStore } from "zustand/vanilla";

const editorMarqueeSelectionStore = createStore((set) => ({
  startCoords: null,
  currentCoords: null,
  editorTree: null,
  editorBlocks: null,
  rafID: null,

  setStartCoords: (coords) => set({ startCoords: coords }),
  setCurrentCoords: (coords) => set({ currentCoords: coords }),
  setEditorTree: (tree) => set({ editorTree: tree }),
  setEditorBlocks: (blocks) => set({ editorBlocks: blocks }),
  setRafID: (id) => set({ rafID: id }),

  reset: () =>
    set({
      startCoords: null,
      currentCoords: null,
      editorTree: null,
      editorBlocks: null,
      rafID: null,
    }),
}));

export default editorMarqueeSelectionStore;
