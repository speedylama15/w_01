import { TextSelection } from "@tiptap/pm/state";
import { useCurrentEditor } from "@tiptap/react";
import { useStore } from "zustand";

import blockHandleStore from "../../stores/blockHandleStore";

import { MultiBlockSelection } from "../../selections/MultiBlockSelection";

import { getDepthByNodeType } from "../../utils/depth/getDepthByNodeType";

import "./BlockHandle.css";

// todo: add tooltip
// todo: mousedown -> lock it
// todo: mouseup -> unlock it
// todo: multiple node/s drag and drop

const BlockHandle = () => {
  const editor = useCurrentEditor();

  const {
    isOpen,
    rect,
    pos: handlePos,
    node: handleNode,
  } = useStore(blockHandleStore);

  const handleMouseDown = (e) => {
    // idea: maintains focus on the editor
    e.preventDefault();

    const { view } = editor;
    const { tr } = view.state;
    const { dispatch } = view;
    const { selection } = tr;
    const { $from, $to, from, to } = selection;

    // when ranged TextSelection and handleState.pos is inclusive
    if (selection instanceof TextSelection && from !== to) {
      const fromResult = getDepthByNodeType($from, "block");
      const toResult = getDepthByNodeType($to, "block");

      // handle error
      if (fromResult === null || toResult === null) return;

      const fromBefore = $from.before(fromResult.depth);
      const toAfter = $to.after(toResult.depth);

      if (handlePos >= fromBefore && handlePos < toAfter) {
        const multiSelection = MultiBlockSelection.create(
          tr.doc,
          fromBefore,
          toAfter,
        );

        dispatch(tr.setSelection(multiSelection));

        window.getSelection()?.removeAllRanges();

        return;
      }
    }

    // when MultiSelection and handleState.pos is inclusive
    if (selection instanceof MultiBlockSelection) {
      const { $anchor, $head } = selection;

      if (handlePos >= $anchor.pos && handlePos < $head.pos) {
        const multiSelection = MultiBlockSelection.create(
          tr.doc,
          $anchor.pos,
          $head.pos,
        );

        dispatch(tr.setSelection(multiSelection));

        window.getSelection()?.removeAllRanges();

        return;
      }
    }

    if (!handleNode) return;

    // normally just multi select the corresponding block when it was pressed
    const multiSelection = MultiBlockSelection.create(
      tr.doc,
      handlePos,
      handlePos + handleNode.nodeSize,
    );

    dispatch(tr.setSelection(multiSelection));

    window.getSelection()?.removeAllRanges();

    return;
  };

  return (
    <>
      {isOpen && (
        <div
          tabIndex="-1"
          className="block-handle"
          style={{
            transform: `
              translate(calc(${rect.x}px - 100%), 
              ${rect.y + window.scrollY + 4}px)
            `,
          }}
          onMouseDown={handleMouseDown}
        ></div>
      )}
    </>
  );
};

export default BlockHandle;
