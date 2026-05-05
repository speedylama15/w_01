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

// idea: if the selection is ranged and the offset is not 0, I still want to select the prev cell or block

const isAtStart = ($pos) => {
  return $pos.parentOffset === 0;
};

const ArrowLeft = Extension.create({
  name: "ArrowLeft",

  addKeyboardShortcuts() {
    return {
      ArrowLeft: ({ editor }) => {
        const { tr, selection } = editor.state;
        const { dispatch } = editor.view;
        const { from, to, $anchor, $head } = selection;

        if (selection instanceof TextSelection) {
          const $sel = from === to ? $anchor : $head;

          // idea: allow default to occur
          if (!isAtStart($sel) && from === to) {
            return false;
          }

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

            const tableDOM = cellDOM.closest("table");
            const rowDOM = cellDOM.parentNode;
            const cellIndex = cellDOM.cellIndex;

            let leftCellData = null;

            const immediateLeftCell = rowDOM.children[cellIndex - 1];

            if (!immediateLeftCell) {
              const prevRowIndex = rowDOM.rowIndex - 1;

              const prevRow = tableDOM.rows[prevRowIndex];

              if (prevRow)
                leftCellData = {
                  rowIndex: prevRowIndex,
                  cellIndex: rowDOM.children.length - 1,
                };
            } else {
              leftCellData = {
                rowIndex: rowDOM.rowIndex,
                cellIndex: cellIndex - 1,
              };
            }

            // move to cell on right
            if (leftCellData) {
              const { rowIndex, cellIndex } = leftCellData;

              const tableMap = getTableMap(tableNode, $sel.before(tableDepth));

              const { grid } = tableMap;
              const targetRow = grid[rowIndex];
              const targetCell = targetRow[cellIndex];

              const sel = TextSelection.create(
                tr.doc,
                targetCell.pos + targetCell.node.nodeSize - 2,
              );
              tr.setSelection(sel);
              dispatch(tr);

              return true;
            }

            if (!leftCellData) {
              const currBlockResult = getCurrNode($sel, "block");
              if (!currBlockResult) return true;

              const prevBlockResult = getPrevNode(tr, currBlockResult.before);
              if (!prevBlockResult) return true;

              const {
                node: prevBlock,
                before: prevBlockBefore,
                after: prevBlockAfter,
              } = prevBlockResult;

              if (prevBlock.isTextblock) {
                const $end = tr.doc.resolve(prevBlockAfter);
                const sel = TextSelection.near($end, -1);

                tr.setSelection(sel);

                dispatch(tr);

                return true;
              }

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

          // is text but not cell
          if (!isCellNode(currNode)) {
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

export default ArrowLeft;
