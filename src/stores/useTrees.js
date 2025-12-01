import { create } from "zustand";
import RBush from "rbush";

import useApp from "./useApp";

import { getRotatedVertices } from "../utils/getRotatedVertices";

const useTrees = create((set, get) => {
  return {
    nodesTree: new RBush(),
    set_nodesTree: (nodeIDs) =>
      set(() => {
        const tree = new RBush();
        const map = useApp.getState().nodesMap;
        const newMap = { ...map };
        nodeIDs.forEach((id) => delete newMap[id]);

        const boxes = Object.values(newMap).map((node) => {
          const { minX, maxX, minY, maxY, width, height } =
            getRotatedVertices(node);

          return {
            node,
            minX,
            minY,
            maxX,
            maxY,
            width,
            height,
          };
        });

        tree.load(boxes);

        return { nodesTree: tree };
      }),
    reset_nodesTree: () => set(() => ({ nodesTree: new RBush() })),

    edgesTree: new RBush(),
    connectorsTree: new RBush(),

    set_edgesTree: (tree) => set(() => ({ edgesTree: tree })),
    set_connectorsTree: (tree) => set(() => ({ connectorsTree: tree })),

    searchBoxesTree: new RBush(),
    set_searchBoxesTree: (box) =>
      set(() => ({ searchBoxesTree: new RBush().insert(box) })),
    reset_searchBoxesTree: () => set(() => ({ searchBoxesTree: new RBush() })),

    set_treeThatRerenders: (bbox) => {
      get().nodesTree.remove(bbox);
      set({ nodesTree: get().nodesTree });
    },
  };
});

export default useTrees;
