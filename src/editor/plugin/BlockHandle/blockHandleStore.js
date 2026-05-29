import { create } from "zustand";

const blockHandleStore = create((set) => {
  return {
    isLocked: false,
    setIsLocked: (bool) => set({ isLocked: bool }),
    showDropdown: false,
    setShowDropdown: (bool) => set({ showDropdown: bool }),
    dom: null,
    rect: null,
    setDOM: (dom) => set({ dom }),
    setRect: (rect) => set({ rect }),
    renderHandle: (dom, rect) =>
      set({
        dom,
        rect,
      }),
    hideHandle: () =>
      set({
        dom: null,
        rect: null,
      }),
  };
});

export default blockHandleStore;
