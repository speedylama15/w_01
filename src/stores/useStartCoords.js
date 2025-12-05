import { create } from "zustand";

const useStartCoords = create((set) => {
  return {
    startCoords: null,

    set_startCoords: (coords) => set(() => ({ startCoords: coords })),
  };
});

export default useStartCoords;
