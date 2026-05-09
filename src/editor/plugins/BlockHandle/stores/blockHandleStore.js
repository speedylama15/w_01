import { create } from "zustand";

const blockHandleStore = create((set) => {
  return {
    isLocked: false,
    isClicked: false,
    isDragging: false,
    setIsLocked: (bool) => set({ isLocked: bool }),
    setIsClicked: (bool) => set({ isClicked: bool }),
    setIsDragging: (bool) => set({ isDragging: bool }),

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
