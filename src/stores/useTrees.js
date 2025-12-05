import { create } from "zustand";
import RBush from "rbush";

import useNodes from "./useNodes";

import { getNodeAABB } from "../utils/getNodeAABB";

const useTrees = create((set) => {
  return {
    nodesTree: new RBush(),

    set_nodesTree: (nodeIDs) =>
      set(() => {
        const tree = new RBush();
        const map = useNodes.getState().nodesMap;
        const newMap = { ...map };
        // filter
        nodeIDs.forEach((id) => delete newMap[id]);

        const boxes = Object.values(newMap).map((node) => {
          return getNodeAABB(node);
        });

        console.log(boxes, "boxes");

        tree.load(boxes);

        return { nodesTree: tree };
      }),

    reset_nodesTree: () => set(() => ({ nodesTree: new RBush() })),
  };
});

export default useTrees;
