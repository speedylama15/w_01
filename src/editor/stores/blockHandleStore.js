import { createStore } from "zustand/vanilla";

const BlockHandleStore = createStore((set) => ({
  isOpen: false,
  isLocked: false,
  isDown: false,
  isClicked: false,
  isDragging: false,
  rect: null,
  dom: null,

  isMenuOpen: false,
  setIsMenuOpen: (bool) => set({ isMenuOpen: bool }),

  setIsOpen: (bool) => set({ isOpen: bool }),
  setIsDown: (bool) => set({ isDown: bool }),
  setIsClicked: (bool) => set({ isClicked: bool }),
  setIsDragging: (bool) => set({ isDragging: bool }),
  setRect: (rect) => set({ rect }),
  setIsLocked: (bool) => set({ isLocked: bool }),
  set: (isOpen, rect, dom) => set({ isOpen, rect, dom }),
}));

export default BlockHandleStore;
