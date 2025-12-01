import { create } from "zustand";

const usePanning = create((set) => {
  return {
    panOffsetCoords: { x: 0, y: 0 },
    set_panOffsetCoords: (panOffsetCoords) =>
      set((state) => ({
        panOffsetCoords:
          typeof panOffsetCoords === "function"
            ? // idea: if function, provide the prev value
              panOffsetCoords(state.panOffsetCoords)
            : panOffsetCoords,
      })),

    scale: 1,
    set_scale: (scale) => set(() => ({ scale })),
  };
});

export default usePanning;
