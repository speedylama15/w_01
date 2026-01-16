import { useStore } from "zustand";

import blockHandleStore from "../../stores/blockHandleStore";

import "./BlockHandle.css";

// todo: add tooltip
// mousedown -> lock it
// mouseup -> unlock it
// todo: obtain the node
// todo: obtain the before and after

const BlockHandle = () => {
  const state = useStore(blockHandleStore);

  return (
    <>
      {state.isOpen && (
        <div
          className="block-handle"
          style={{
            transform: `translate(calc(${state.rect.x}px - 100%), ${state.rect.y + 4}px)`,
          }}
        ></div>
      )}
    </>
  );
};

export default BlockHandle;
