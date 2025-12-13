import { create } from "zustand";

import edgesMap from "../data/edgesMap";

const useEdges = create((set) => {
  return {
    edgesMap,
    add_edge: (edge) =>
      set((state) => {
        return {
          edgesMap: {
            ...state.edgesMap,
            [edge.id]: edge,
          },
        };
      }),
    set_node: (edge) =>
      set((state) => ({
        edgesMap: {
          ...state.edgesMap,
          [edge.id]: edge,
        },
      })),

    newEdge: null,
    set_newEdge: (edge) => set(() => ({ newEdge: edge })),
  };
});

export default useEdges;
