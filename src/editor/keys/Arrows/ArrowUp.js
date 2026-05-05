import { Extension } from "@tiptap/core";
import { TextSelection } from "@tiptap/pm/state";
import { CellSelection } from "prosemirror-tables";
import { MultiBlockSelection } from "../../selections/MultiBlockSelection";

import {
  getNodeByContentType,
  getTableMap,
  isCellNode,
  getCurrNode,
  getPrevNode,
} from "../../utils";

// todo: change the naming conventions
// todo: add a try catch block and in the catch, return true
// todo: scrollIntoView is an issue...

const ArrowUp = Extension.create({
  name: "ArrowUp",

  addKeyboardShortcuts() {
    return {
      ArrowUp: ({ editor }) => {
        const { tr, selection } = editor.state;
        const { dispatch } = editor.view;
        const { from, to, $anchor, $head } = selection;

        if (selection instanceof TextSelection) {
          const $sel = from === to ? $anchor : $head;
          const currNodeResult = getCurrNode($sel, "node");
          if (!currNodeResult) return true;

          const { node: currNode, before: currNodeBefore } = currNodeResult;

          if (isCellNode(currNode)) {
            const { node: tableNode, depth: tableDepth } = getNodeByContentType(
              $sel,
              "table",
            );

            const cellDOM = editor.view.domAtPos(currNodeBefore + 1)?.node;

            if (!cellDOM) return true;

            const cellIndex = cellDOM.cellIndex;
            const upperRowIndex = cellDOM.parentNode.rowIndex - 1;

            // jump to the upper cell
            if (upperRowIndex >= 0) {
              const tableMap = getTableMap(tableNode, $sel.before(tableDepth));

              const { grid } = tableMap;
              const targetRow = grid[upperRowIndex];
              const targetCell = targetRow[cellIndex];

              const sel = TextSelection.create(
                tr.doc,
                targetCell.pos + targetCell.node.nodeSize - 2,
              );
              tr.setSelection(sel);
              dispatch(tr);

              return true;
            }

            // need to jump to the previous block
            if (upperRowIndex < 0) {
              // upper cell does not exist
              // therefore, I need to find the previous block and set selection there
              const currBlockResult = getCurrNode($sel, "block");
              if (!currBlockResult) return true;

              const prevBlockResult = getPrevNode(tr, currBlockResult.before);
              if (!prevBlockResult) return true;

              const {
                node: prevBlock,
                before: prevBlockBefore,
                after: prevBlockAfter,
              } = prevBlockResult;

              // text node -> set selection at the end
              if (prevBlock.isTextblock) {
                const $end = tr.doc.resolve(prevBlockAfter);
                const sel = TextSelection.near($end, -1);

                tr.setSelection(sel);

                dispatch(tr);

                return true;
              }

              // non text node -> table -> find the last cell and set selection there
              if (prevBlock.type.name === "table") {
                const prevTable = prevBlock;
                const prevTableBefore = prevBlockBefore;

                const { grid } = getTableMap(prevTable, prevTableBefore);

                const lastRow = grid[grid.length - 1];
                const lastCell = lastRow[lastRow.length - 1];
                const lastCellAfter = lastCell.pos + lastCell.node.nodeSize;

                const $end = tr.doc.resolve(lastCellAfter);
                const sel = TextSelection.near($end, -1);

                tr.setSelection(sel);

                dispatch(tr);

                return true;
              }

              // non text node -> set Multi selection on it
              if (!prevBlock.isTextblock) {
                const sel = MultiBlockSelection.create(
                  tr.doc,
                  prevBlockBefore,
                  prevBlockAfter,
                );

                tr.setSelection(sel);

                dispatch(tr);

                return true;
              }
            }
          }

          if (!isCellNode(currNode)) {
            // here the current node is a text BLOCK obviously
            const prevNodeResult = getPrevNode(tr, currNodeBefore);
            if (!prevNodeResult) return true;
            const {
              node: prevNode,
              before: prevNodeBefore,
              after: prevNodeAfter,
            } = prevNodeResult;

            if (prevNode.type.name === "table") {
              const prevTable = prevNode;
              const prevTableBefore = prevNodeBefore;

              const { grid } = getTableMap(prevTable, prevTableBefore);

              const lastRow = grid[grid.length - 1];
              const lastCell = lastRow[lastRow.length - 1];
              const lastCellAfter = lastCell.pos + lastCell.node.nodeSize;

              const $end = tr.doc.resolve(lastCellAfter);
              const sel = TextSelection.near($end, -1);

              tr.setSelection(sel);

              dispatch(tr);

              return true;
            }

            if (!prevNode.isTextblock) {
              const sel = MultiBlockSelection.create(
                tr.doc,
                prevNodeBefore,
                prevNodeAfter,
              );

              tr.setSelection(sel);

              dispatch(tr);

              return true;
            }

            // let default behavior happen if the previous block is a text block
            if (prevNode.isTextblock) return false;
          }
        }

        if (selection instanceof CellSelection) {
          //
        }

        if (selection instanceof MultiBlockSelection) {
          //
        }

        return false;
      },
    };
  },
});

export default ArrowUp;
