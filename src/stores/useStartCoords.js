import { create } from "zustand";

// FIX: this has become useless
const useStartCoords = create((set) => {
  return {
    startCoords: null,

    set_startCoords: (coords) => set(() => ({ startCoords: coords })),
  };
});

export default useStartCoords;
