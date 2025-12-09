import { create } from "zustand";
import RBush from "rbush";

import useNodes from "./useNodes";

import { getNodeAABB } from "../utils/getNodeAABB";

const getInitNodesTree = () => {
  const tree = new RBush();
  const nodesMap = useNodes.getState().nodesMap;
  const boxes = [];

  Object.values(nodesMap).forEach((node) => {
    boxes.push(getNodeAABB(node));
  });

  tree.load(boxes);

  return tree;
};

const useTrees = create((set) => {
  return {
    // nodesTree: new RBush(),
    nodesTree: getInitNodesTree(),

    set_nodesTree: (selectedNode) =>
      set(() => {
        const tree = new RBush();
        const nodesMap = { ...useNodes.getState().nodesMap };
        const boxes = [];

        Object.values(nodesMap).forEach((node) => {
          if (node.id !== selectedNode?.id) boxes.push(getNodeAABB(node));
        });

        tree.load(boxes);

        return { nodesTree: tree };
      }),

    reset_nodesTree: () => set(() => ({ nodesTree: new RBush() })),
  };
});

export default useTrees;
