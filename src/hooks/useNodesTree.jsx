import { useEffect } from "react";

import useSelection from "../stores/useSelection";
import useTrees from "../stores/useTrees";

// review: only need to focus on stationary/non-selected Nodes
// idea: the selected nodes will be handled inside of mousemove or mouseup
// review: the stationary nodes will go through the culling process
const useNodesTree = () => {
  const singleSelectedNode = useSelection((state) => state.singleSelectedNode);
  // will have to add multiSelectedNodes for additional filtering

  const set_nodesTree = useTrees((state) => state.set_nodesTree);

  useEffect(() => {
    set_nodesTree(singleSelectedNode);
  }, [singleSelectedNode, set_nodesTree]);
};

export default useNodesTree;

// FIX: grouping of multi nodes
// mouse up
// loop through selected single/multi nodes
// calculate each node's aabb
// check for the node's groupID property
// if it had a value that means it was part of another group node
// if it does not. That means it's finding a group?
// search and find nearby nodes
// look for group nodes
// simplify it and find the first one and give association to that group node
