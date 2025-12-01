import { create } from "zustand";

import nodesMap from "../data/nodesMap";

const useNodes = create((set) => {
  return {
    nodesMap,

    set_node: (nodeID, node) =>
      set((state) => ({
        nodesMap: {
          ...state.nodesMap,
          [nodeID]: node,
        },
      })),
  };
});

export default useNodes;
