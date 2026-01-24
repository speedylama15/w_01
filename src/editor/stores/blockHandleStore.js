import { createStore } from "zustand/vanilla";

const blockHandleStore = createStore((set) => ({
  isOpen: false,
  rect: null,
  dom: null,
  node: null,
  pos: null,

  set_blockHandle: (updates) => set((state) => ({ ...state, ...updates })),
}));

export default blockHandleStore;
