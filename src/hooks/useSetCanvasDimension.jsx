import { useEffect } from "react";

import useWrapperRect from "../stores/useWrapperRect";

const useSetCanvasDimension = (ref) => {
  const wrapperRect = useWrapperRect((state) => state.wrapperRect);

  useEffect(() => {
    // idea: perhaps I could create a custom hook and set this init setup for all canvas
    // review: wrapperRect will only change when resize has occurred
    // review: but this is for init set up
    // debug: resizing of canvas or setting of canvas' dimension should be done only when necessary
    const canvas = ref.current;

    const dpr = window.devicePixelRatio || 1;

    canvas.width = wrapperRect.width * dpr;
    canvas.height = wrapperRect.height * dpr;
    canvas.style.width = wrapperRect.width + "px";
    canvas.style.height = wrapperRect.height + "px";
  }, [wrapperRect, ref]);
};

export default useSetCanvasDimension;
