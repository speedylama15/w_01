import { create } from "zustand";

const radialMenuStore = create((set) => {
  return {
    isRadialMenuOpen: false,
    radialMenuCoords: null,

    setIsRadialMenuOpen: (bool) => set({ isRadialMenuOpen: bool }),
    setRadialMenuCoords: (coords) => set({ radialMenuCoords: coords }),
  };
});

export default radialMenuStore;
