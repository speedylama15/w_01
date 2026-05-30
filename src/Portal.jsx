import { useStore } from "zustand";

import blockHandleStore from "./editor/plugin/blockHandle/blockHandleStore.js";

import BlockHandle from "./editor/plugin/blockHandle/components/BlockHandle/BlockHandle.jsx";
import BlockHandleMenu from "./editor/plugin/blockHandle/components/BlockHandleMenu/BlockHandleMenu.jsx";
import MarqueeSelection from "./editor/plugin/marqueeSelection/MarqueeSelection.jsx";

const Portal = () => {
  const { showDropdown } = useStore(blockHandleStore);

  return (
    <div className="portal">
      <BlockHandle />

      {showDropdown && <BlockHandleMenu />}

      <MarqueeSelection />
    </div>
  );
};

export default Portal;
