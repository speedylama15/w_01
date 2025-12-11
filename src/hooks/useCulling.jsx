import { useCallback, useRef, useMemo, useEffect } from "react";
import throttle from "lodash.throttle";

import useNodes from "../stores/useNodes";
import usePanning from "../stores/usePanning";
import useWrapperRect from "../stores/useWrapperRect";
import useTrees from "../stores/useTrees";
import useSelection from "../stores/useSelection";

import { getWrapperBox } from "../utils/getWRAPPERBOX";
import { getNodeAABB } from "../utils/getNodeAABB";

const useCulling = () => {
  // todo
  const nodesTree = useTrees((state) => state.nodesTree);
  const visibleNodes = useNodes((state) => state.visibleNodes);
  const set_visibleNodes = useNodes((state) => state.set_visibleNodes);
  const wrapperRect = useWrapperRect((state) => state.wrapperRect);
  const { scale, panOffsetCoords } = usePanning();
  // todo

  // todo
  const visibleNodesRef = useRef(null);
  const callbackID = useRef();
  const indexRef = useRef(0);
  const isMountedRef = useRef(false);
  const prevIDRef = useRef(null);

  // this makes use of getState
  // therefore, this function is memoized!!!
  const getVisibleNodes = useCallback(() => {
    const panOffsetCoords = usePanning.getState().panOffsetCoords;
    const scale = usePanning.getState().scale;
    // idea: maybe I can use Electron's feature to get wrapperRect before the painting of HTML and set the state?
    const wrapperRect = useWrapperRect.getState().wrapperRect;
    const nodesTree = useTrees.getState().nodesTree;

    const WRAPPERBOX = getWrapperBox(panOffsetCoords, scale, wrapperRect);

    const result = nodesTree.search(WRAPPERBOX);

    const singleSelectedNode = useSelection.getState().singleSelectedNode;

    if (singleSelectedNode)
      return {
        id: `result-${Math.random()}`,
        result: [...result, getNodeAABB(singleSelectedNode)],
      };

    return { id: `result-${Math.random()}`, result };
  }, []);

  const throttle_getVisibleNodes = useMemo(
    // debug
    () => throttle(getVisibleNodes, 100),
    [getVisibleNodes]
  );

  // review: gotta make sure that selected node/s are ALWAYS visibile even if panned out
  // todo: inside of set_visibleNodes -> always include them, they do not need to be part of nodesTree/rTree
  useEffect(() => {
    if (!isMountedRef.current && wrapperRect.x) {
      // it takes time for wrapperRect to be set in
      // when wrapperRect is set ONLY then will isMountedRef become true
      isMountedRef.current = true;

      const { id, result } = getVisibleNodes();

      // set the initial visible nodes
      set_visibleNodes(result);

      // set ID
      prevIDRef.current = id;
    }

    if (isMountedRef.current) {
      const { id: currID, result: currResult } = throttle_getVisibleNodes();

      // got brand new results
      if (prevIDRef.current !== currID) {
        const prevNodesMap = {};
        const prevResult = useNodes.getState().visibleNodes;

        const stillVisibleNodes = [];
        const newVisibleNodes = [];

        // convert the previous result to a map
        prevResult.forEach((item) => {
          const node = item.node;

          prevNodesMap[node.id] = true;
        });

        // loop through the current result
        currResult.forEach((item) => {
          const node = item.node;
          const isFound = prevNodesMap[node.id];

          if (isFound) {
            stillVisibleNodes.push(item);
          } else {
            newVisibleNodes.push(item);
          }
        });

        // debug: quick test
        // set_visibleNodes(stillVisibleNodes);
        set_visibleNodes(stillVisibleNodes);
        // set_visibleNodes([...stillVisibleNodes, ...newVisibleNodes]);

        prevIDRef.current = currID;
      } else if (prevIDRef.current === currID) {
        // just do what you were doing

        console.log("keep rendering new nodes");
      }

      // useEffect invoked? -> fetch new set of visibleNodes -> cancel all callbacks
      // cancelIdleCallback(callbackID.current);

      // reset the index
      // indexRef.current = 0;

      // visibleNodesRef.current = null;

      // set_visibleNodes([]);

      // throttle
      // visibleNodesRef.current = throttle_getVisibleNodes();

      // const callback_progressiveRendering = (deadline) => {
      //   while (
      //     deadline.timeRemaining() &&
      //     indexRef.current < visibleNodesRef.current.length - 1
      //   ) {
      //     const node = visibleNodesRef.current[indexRef.current];
      //     set_visibleNodes([...useNodes.getState().visibleNodes, node]);
      //     indexRef.current++;
      //   }
      //   if (indexRef.current >= visibleNodesRef.current.length - 1) {
      //     cancelIdleCallback(callbackID.current);
      //   }
      //   if (indexRef.current < visibleNodesRef.current.length - 1) {
      //     callbackID.current = requestIdleCallback(
      //       callback_progressiveRendering
      //     );
      //   }
      // };

      // if (visibleNodesRef.current && visibleNodesRef.current.length > 500) {
      //   // store the id
      //   callbackID.current = requestIdleCallback(callback_progressiveRendering);
      // } else if (visibleNodesRef.current) {
      //   set_visibleNodes(visibleNodesRef.current);
      // }
    }

    // return () => {
    //   cancelIdleCallback(callbackID.current);
    // };
  }, [
    panOffsetCoords,
    scale,
    wrapperRect,
    nodesTree,
    set_visibleNodes,
    throttle_getVisibleNodes,
    getVisibleNodes,
  ]);
  // todo
};

export default useCulling;
