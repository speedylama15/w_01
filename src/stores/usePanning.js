import { create } from "zustand";

const usePanning = create((set) => {
  return {
    panOffsetCoords: { x: 0, y: 0 },
    scale: 1,
    set_panOffsetCoords: (coords) => set(() => ({ panOffsetCoords: coords })),
    set_scale: (scale) => set(() => ({ scale })),
  };
});

export default usePanning;
