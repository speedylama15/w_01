import { create } from "zustand";

const useMouse = create((set) => {
  return {
    mouseState: null,

    set_mouseState: (mouseState) => set(() => ({ mouseState })),
  };
});

export default useMouse;
