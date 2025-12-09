import React, { useMemo } from "react";
import usePanning from "../stores/usePanning";

const useLOD = () => {
  const scale = usePanning((state) => state.scale);

  const LOD = useMemo(() => {
    if (scale < 0.2) return "low";
    return "high";
  }, [scale]);

  return LOD;
};

export default useLOD;
