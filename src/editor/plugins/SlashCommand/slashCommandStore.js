import { create } from "zustand";

const slashCommandStore = create((set) => {
  return {
    operation: null,
    coords: null,
    pos: null,

    setOperation: (operation) => set({ operation }),
    setCoords: (coords) => set({ coords }),
    setPos: (pos) => set({ pos }),
  };
});

export default slashCommandStore;
