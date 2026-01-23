import { TextSelection } from "@tiptap/pm/state";
import { useCurrentEditor } from "@tiptap/react";
import { useStore } from "zustand";

import blockHandleStore from "../../stores/blockHandleStore";

import { MultiBlockSelection } from "../../selections/MultiBlockSelection";

import "./BlockHandle.css";

// todo: add tooltip
// todo: mousedown -> lock it
// todo: mouseup -> unlock it
// todo: multiple node/s drag and drop

const BlockHandle = () => {
  const editor = useCurrentEditor();

  const blockHandleState = useStore(blockHandleStore);

  const handleMouseDown = (e) => {
    // idea: maintains focus on the editor
    e.preventDefault();

    const { view } = editor;
    const { tr } = view.state;
    const { dispatch } = view;
    const { selection } = tr;

    // when text is highlighted, create multiple node selection for multiple block/node/s
    if (selection instanceof TextSelection && selection.from !== selection.to) {
      const selections = MultiBlockSelection.create(
        tr.doc,
        selection.from,
        selection.to
      );

      dispatch(tr.setSelection(selections));

      window.getSelection().removeAllRanges();

      return;
    }

    // handles when there is no focus on the editor
    // handles when a single browser selection has been made
    // when a single browser selection has been made but another node/block has been clicked
    const selections = MultiBlockSelection.create(
      tr.doc,
      blockHandleState.pos,
      blockHandleState.pos + blockHandleState.node.nodeSize
    );

    dispatch(tr.setSelection(selections));

    return;
  };

  return (
    <>
      {blockHandleState.isOpen && (
        <div
          tabIndex="-1"
          className="block-handle"
          style={{
            transform: `translate(calc(${blockHandleState.rect.x}px - 100%), ${blockHandleState.rect.y + window.scrollY + 4}px)`,
          }}
          onMouseDown={handleMouseDown}
        ></div>
      )}
    </>
  );
};

export default BlockHandle;
