import { createStore } from "zustand/vanilla";

const blockHandleStore = createStore((set) => {
  return {
    isOpen: false,
    rect: null,
    dom: null,
    node: null,
    pos: null,

    set_isOpen: (bool) => set(() => ({ isOpen: bool })),
    set_rect: (rect) => set(() => ({ rect })),
    set_dom: (dom) => set(() => ({ dom })),
    set_node: (node) => set(() => ({ node })),
    set_pos: (pos) => set(() => ({ pos })),
  };
});

export default blockHandleStore;
