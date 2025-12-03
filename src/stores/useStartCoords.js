import { create } from "zustand";

const useCoords = create((set) => {
  return {
    startCoords: null,

    set_startCoords: (coords) => set(() => ({ startCoords: coords })),
  };
});

export default useCoords;
