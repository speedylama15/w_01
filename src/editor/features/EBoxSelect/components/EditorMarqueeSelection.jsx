import { useStore } from "zustand";

import { mainStore } from "../../../../stores";
import { editorMarqueeSelectionStore } from "../../../stores";

const EditorMarqueeSelection = () => {
  const { operation } = useStore(mainStore);
  const { startCoords, currentCoords } = useStore(editorMarqueeSelectionStore);

  if (operation === "EDITOR_MARQUEE_SELECTION") {
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

export default EditorMarqueeSelection;
