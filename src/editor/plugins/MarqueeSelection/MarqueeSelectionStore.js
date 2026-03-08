import { createStore } from "zustand/vanilla";

const MarqueeSelectionStore = createStore((set) => ({
  isOpen: false,
  startCoords: null,
  currentCoords: null,

  setIsOpen: (bool) => set({ isOpen: bool }),
  setStartCoords: (coords) =>
    set((state) => ({ ...state, startCoords: coords })),
  setCurrentCoords: (coords) =>
    set((state) => ({ ...state, currentCoords: coords })),
}));

export default MarqueeSelectionStore;
