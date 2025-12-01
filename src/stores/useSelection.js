import { create } from "zustand";

const useSelection = create((set) => {
  return {
    // review: BOX > Node
    selectedBoxesMap: {},
    set_selectedBoxesMap: (obj) =>
      set(() => ({ selectedBoxesMap: { ...obj } })),
    reset_selectedBoxesMap: () => set(() => ({ selectedBoxesMap: {} })),
  };
});

export default useSelection;
