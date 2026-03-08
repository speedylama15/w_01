import { useStore } from "zustand";

import MarqueeSelectionStore from "./MarqueeSelectionStore";

const MarqueeSelection = () => {
  const isOpen = useStore(MarqueeSelectionStore, (state) => state.isOpen);
  const startCoords = useStore(
    MarqueeSelectionStore,
    (state) => state.startCoords,
  );
  const currentCoords = useStore(
    MarqueeSelectionStore,
    (state) => state.currentCoords,
  );

  if (isOpen) {
    const top = Math.min(startCoords.pageY, currentCoords.pageY);
    const left = Math.min(startCoords.pageX, currentCoords.pageX);
    const width = Math.abs(currentCoords.pageX - startCoords.pageX);
    const height = Math.abs(currentCoords.pageY - startCoords.pageY);

    return (
      <div
        style={{
          position: "absolute",
          top: top + "px",
          left: left + "px",
          width: width + "px",
          height: height + "px",
          backgroundColor: "#96afde6b",
          border: "1px solid #004cff",
          borderRadius: "7px",
          pointerEvents: "none",
        }}
      />
    );
  }
};

export default MarqueeSelection;
