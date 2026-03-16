import { create } from "zustand";

const blockHandleStore = create((set) => {
  return {
    isRendered: false,
    isOpen: false,
    isLocked: false,
    node: null,
    dom: null,
    rect: null,

    setIsRendered: (bool) => set({ isRendered: bool }),
    setIsOpen: (bool) => set({ isOpen: bool }),
    setIsLocked: (bool) => set({ isLocked: bool }),
    setNode: (node) => set({ node }),
    setDOM: (dom) => set({ dom }),
    setRect: (rect) => set({ rect }),
  };
});

export default blockHandleStore;
