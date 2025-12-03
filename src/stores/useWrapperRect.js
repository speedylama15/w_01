import { create } from "zustand";

const useWrapperRect = create((set) => {
  return {
    wrapperRect: {},
    set_wrapperRect: (rect) => set(() => ({ wrapperRect: rect })),
  };
});

export default useWrapperRect;
