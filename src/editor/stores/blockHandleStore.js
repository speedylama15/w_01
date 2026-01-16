import { createStore } from "zustand/vanilla";

const blockHandleStore = createStore((set) => {
  return {
    isOpen: false,
    rect: null,
    dom: null,

    set_isOpen: (bool) => set(() => ({ isOpen: bool })),
    set_rect: (rect) => set(() => ({ rect })),
    set_dom: (dom) => set(() => ({ dom })),
  };
});

export default blockHandleStore;
