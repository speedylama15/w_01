import { create } from "zustand";

const useResize = create((set) => {
  return {
    resizeData: null,
    set_resizeData: (data) => set(() => ({ resizeData: data })),
  };
});

export default useResize;
