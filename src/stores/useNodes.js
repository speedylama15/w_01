import { create } from "zustand";

import nodesMap from "../data/nodesMap";

const useNodes = create((set) => {
  return {
    // nodesMap
    nodesMap,
    add_node: (node) =>
      set((state) => {
        return {
          nodesMap: {
            ...state.nodesMap,
            [node.id]: node,
          },
        };
      }),
    set_node: (node) =>
      set((state) => ({
        nodesMap: {
          ...state.nodesMap,
          [node.id]: node,
        },
      })),

    // newNode
    newNode: null,
    set_newNode: (node) => set(() => ({ newNode: node })),
  };
});

export default useNodes;
