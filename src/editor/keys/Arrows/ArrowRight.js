import { Extension } from "@tiptap/core";
import { TextSelection } from "@tiptap/pm/state";
import { CellSelection } from "prosemirror-tables";
import { MultiBlockSelection } from "../../selections/MultiBlockSelection";

import {
  getNodeByContentType,
  getTableMap,
  isCellNode,
  getCurrNode,
  getNextNode,
} from "../../utils";

// idea: if the selection is ranged and the offset is not at the end, I still want to select the next cell or block

const isAtEnd = ($pos) => {
  return $pos.parentOffset === $pos.parent.content.size;
};

const ArrowRight = Extension.create({
  name: "ArrowRight",

  addKeyboardShortcuts() {
    return {
      ArrowRight: ({ editor }) => {
        const { tr, selection } = editor.state;
        const { dispatch } = editor.view;
        const { from, to, $anchor, $head } = selection;

        if (selection instanceof TextSelection) {
          const $sel = from === to ? $anchor : $head;

          // idea: allow default to occur
          if (!isAtEnd($sel) && from === to) {
            return false;
          }

          const currNodeResult = getCurrNode($sel, "node");
          if (!currNodeResult) return true;

          const {
            node: currNode,
            before: currNodeBefore,
            after: currNodeAfter,
          } = currNodeResult;

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

            let rightCellData = null;

            const immediateRightCell = rowDOM.children[cellIndex + 1];

            if (!immediateRightCell) {
              const nextRowIndex = rowDOM.rowIndex + 1;

              const nextRow = tableDOM.rows[nextRowIndex];

              if (nextRow)
                rightCellData = { rowIndex: nextRowIndex, cellIndex: 0 };
            } else {
              rightCellData = {
                rowIndex: rowDOM.rowIndex,
                cellIndex: cellIndex + 1,
              };
            }

            // move to cell on right
            if (rightCellData) {
              const { rowIndex, cellIndex } = rightCellData;

              const tableMap = getTableMap(tableNode, $sel.before(tableDepth));

              const { grid } = tableMap;
              const targetRow = grid[rowIndex];
              const targetCell = targetRow[cellIndex];

              const sel = TextSelection.create(tr.doc, targetCell.pos + 2);
              tr.setSelection(sel);
              dispatch(tr);

              return true;
            }

            if (!rightCellData) {
              const currBlockResult = getCurrNode($sel, "block");
              if (!currBlockResult) return true;

              const nextBlockResult = getNextNode(tr, currBlockResult.after);
              if (!nextBlockResult) return true;

              const {
                node: nextBlock,
                before: nextBlockBefore,
                after: nextBlockAfter,
              } = nextBlockResult;

              if (nextBlock.isTextblock) {
                const $start = tr.doc.resolve(nextBlockBefore);
                const sel = TextSelection.near($start);

                tr.setSelection(sel);

                dispatch(tr);

                return true;
              }

              if (nextBlock.type.name === "table") {
                const nextTable = nextBlock;
                const nextTableBefore = nextBlockBefore;

                const { grid } = getTableMap(nextTable, nextTableBefore);

                const firstRow = grid[0];
                const firstCell = firstRow[0];
                const firstCellBefore = firstCell.pos;

                const $start = tr.doc.resolve(firstCellBefore);
                const sel = TextSelection.near($start);

                tr.setSelection(sel);

                dispatch(tr);

                return true;
              }

              if (!nextBlock.isTextblock) {
                const sel = MultiBlockSelection.create(
                  tr.doc,
                  nextBlockBefore,
                  nextBlockAfter,
                );

                tr.setSelection(sel);

                dispatch(tr);

                return true;
              }
            }
          }

          // is text but not cell
          if (!isCellNode(currNode)) {
            const nextNodeResult = getNextNode(tr, currNodeAfter);
            if (!nextNodeResult) return true;

            const {
              node: nextNode,
              before: nextNodeBefore,
              after: nextNodeAfter,
            } = nextNodeResult;

            if (nextNode.type.name === "table") {
              const nextTable = nextNode;
              const nextTableBefore = nextNodeBefore;

              const { grid } = getTableMap(nextTable, nextTableBefore);

              const firstRow = grid[0];
              const firstCell = firstRow[0];
              const firstCellBefore = firstCell.pos;

              const $start = tr.doc.resolve(firstCellBefore);
              const sel = TextSelection.near($start);

              tr.setSelection(sel);

              dispatch(tr);

              return true;
            }

            if (!nextNode.isTextblock) {
              const sel = MultiBlockSelection.create(
                tr.doc,
                nextNodeBefore,
                nextNodeAfter,
              );

              tr.setSelection(sel);

              dispatch(tr);

              return true;
            }

            if (nextNode.isTextblock) return false;
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

export default ArrowRight;
