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

const ArrowDown = Extension.create({
  name: "ArrowDown",

  addKeyboardShortcuts() {
    return {
      ArrowDown: ({ editor }) => {
        const { tr, selection } = editor.state;
        const { dispatch } = editor.view;
        const { from, to, $anchor, $head } = selection;

        if (selection instanceof TextSelection) {
          const $sel = from === to ? $anchor : $head;
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

            const cellIndex = cellDOM.cellIndex;
            const bottomRowIndex = cellDOM.parentNode.rowIndex + 1;
            const maxRowIndex = cellDOM.closest("table").rows.length - 1;

            if (bottomRowIndex <= maxRowIndex) {
              const tableMap = getTableMap(tableNode, $sel.before(tableDepth));

              const { grid } = tableMap;
              const targetRow = grid[bottomRowIndex];
              const targetCell = targetRow[cellIndex];

              const sel = TextSelection.create(
                tr.doc,
                targetCell.pos + targetCell.node.nodeSize - 2,
              );
              tr.setSelection(sel);
              dispatch(tr);

              return true;
            }

            if (bottomRowIndex > maxRowIndex) {
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
                const $end = tr.doc.resolve(nextBlockAfter);
                const sel = TextSelection.near($end, -1);

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

                const firstCellAfter = firstCell.pos + firstCell.node.nodeSize;
                const $end = tr.doc.resolve(firstCellAfter);
                const sel = TextSelection.near($end, -1);

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

              const firstCellAfter = firstCell.pos + firstCell.node.nodeSize;
              const $end = tr.doc.resolve(firstCellAfter);
              const sel = TextSelection.near($end, -1);

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

export default ArrowDown;
