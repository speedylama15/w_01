import { create } from "zustand";

const useSelection = create((set) => {
  return {
    // idea: maybe I can optimize this via storing only the IDs, but maybe that's overengineering
    singleSelectedNode: null,
    set_singleSelectedNode: (node) => set(() => ({ singleSelectedNode: node })),
  };
});

export default useSelection;
