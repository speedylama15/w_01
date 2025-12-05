import { useEffect, useRef } from "react";

import useTrees from "../../stores/useTrees";
import usePanning from "../../stores/usePanning";
import useWrapperRect from "../../stores/useWrapperRect";

const NodesTree = () => {
  const nodesTree = useTrees((state) => state.nodesTree);
  const wrapperRect = useWrapperRect((state) => state.wrapperRect);
  const scale = usePanning((state) => state.scale);
  const panOffsetCoords = usePanning((state) => state.panOffsetCoords);

  const ref = useRef();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.translate(panOffsetCoords.x, panOffsetCoords.y);
    ctx.scale(scale, scale);

    nodesTree.all().forEach((box) => {
      ctx.strokeStyle = "#130ff9ff";
      ctx.strokeRect(
        box.minX,
        box.minY,
        box.maxX - box.minX,
        box.maxY - box.minY
      );
    });

    ctx.restore();
  }, [scale, panOffsetCoords, nodesTree]);

  return (
    <canvas
      ref={ref}
      width={wrapperRect.width}
      height={wrapperRect.height}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 100,
        pointerEvents: "none",
      }}
    />
  );
};

export default NodesTree;
