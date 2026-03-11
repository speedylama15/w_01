import { createStore } from "zustand/vanilla";

const MarqueeSelectionStore = createStore((set) => ({
  startCoords: null,
  currentCoords: null,
  editorTree: null,
  editorBlocks: null,
  rafID: null,

  setStartCoords: (coords) => set({ startCoords: coords }),
  setCurrentCoords: (coords) => set({ currentCoords: coords }),
  setBothCoords: (coords) =>
    set({ startCoords: coords, currentCoords: coords }),
  setEditorTree: (tree) => set({ editorTree: tree }),
  setEditorBlocks: (blocks) => set({ editorBlocks: blocks }),
  setRafID: (id) => set({ rafID: id }),
}));

export default MarqueeSelectionStore;
