import { create } from "zustand";

const dragAndDropStore = create((set) => {
  return {
    rafID: null,
    tree: null,
    nodes: null,
    doms: null,
    targetPos: null,
    currentCoords: null,

    setRafID: (id) => set({ rafID: id }),
    setData: (data) => set(data),
    setTargetPos: (pos) => set({ targetPos: pos }),
    setCurrentCoords: (coords) => set({ currentCoords: coords }),

    reset: () =>
      set({
        rafID: null,
        tree: null,
        nodes: null,
        doms: null,
        targetPos: null,
        currentCoords: null,
      }),
  };
});

export default dragAndDropStore;
