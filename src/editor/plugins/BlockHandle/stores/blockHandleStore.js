import { create } from "zustand";

const blockHandleStore = create((set) => {
  return {
    isClicked: false,
    isDragged: false,
    dom: null,
    rect: null,

    setIsClicked: (bool) => set({ isClicked: bool }),
    setIsDragged: (bool) => set({ isDragged: bool }),
    setDOM: (dom) => set({ dom }),
    setRect: (rect) => set({ rect }),
  };
});

export default blockHandleStore;
