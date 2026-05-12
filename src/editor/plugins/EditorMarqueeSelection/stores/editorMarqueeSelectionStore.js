import { createStore } from "zustand/vanilla";

const editorMarqueeSelectionStore = createStore((set) => ({
  startCoords: null,
  currentCoords: null,
  setStartCoords: (coords) => set({ startCoords: coords }),
  setCurrentCoords: (coords) => set({ currentCoords: coords }),
}));

export default editorMarqueeSelectionStore;
