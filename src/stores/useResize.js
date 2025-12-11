import { create } from "zustand";

const useResize = create((set) => {
  return {
    singleResizeLocation: null,
    set_singleResizeLocation: (location) =>
      set(() => ({ singleResizeLocation: location })),
  };
});

export default useResize;
