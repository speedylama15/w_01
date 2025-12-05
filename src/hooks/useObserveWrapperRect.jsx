import { useEffect } from "react";

import useWrapperRect from "../stores/useWrapperRect";

// idea: when resize occurs, maybe I should nullify/reset everything
// idea: like the alignment lines and anything that relies on wrapperRect

const useObserveWrapperRect = (wrapperRef) => {
  const set_wrapperRect = useWrapperRect((state) => state.set_wrapperRect);

  useEffect(() => {
    const container = wrapperRef.current;

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      const { x, y } = entries[0].target.getBoundingClientRect();
      const rect = { x, y, width, height };

      set_wrapperRect(rect);
    });

    observer.observe(container);

    return () => observer.disconnect();
  }, [wrapperRef, set_wrapperRect]);
};

export default useObserveWrapperRect;
