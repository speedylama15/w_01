import { Extension } from "@tiptap/core";
import { Slice, Fragment } from "prosemirror-model";
import { ReplaceAroundStep, ReplaceStep } from "@tiptap/pm/transform";
import { Table } from "@tiptap/extension-table";
import { TextSelection } from "@tiptap/pm/state";
import MultiSelection from "../selection/MultiSelection";

import {
  getNearestNode,
  getNodeByContentType,
  handleBadSelection,
  isListNode,
  isCellNode,
  getTableMap,
} from "../utils";

// fix: when setting selection, make sure that its a valid position
// review: check for selection instance -> Text/MultiBlock/Cell

export const KeyboardShortcuts = Extension.create({
  name: "keyboardShortcuts",

  addKeyboardShortcuts() {
    return {
      // todo: I wonder if I can insert a table using tr?
      // todo: I think it's better to use tr than to use insertTable command
      "=": ({ editor }) => {
        return (
          editor
            .chain()
            .focus()
            // 25 cols and 200 rows max
            .insertTable({ cols: 7, rows: 7, withHeaderRow: false })
            .run()
        );
      },

      "'": ({ editor }) => {
        return (
          editor
            .chain()
            .focus()
            // 25 cols and 200 rows max
            .insertTable({ cols: 25, rows: 200, withHeaderRow: false })
            .run()
        );
      },

      // fix: use delete range, but if the table is selected in a certain way, extend the range
      // Backspace: ({ editor }) => {
      //   const { selection, tr } = editor.state;
      //   const { dispatch } = editor.view;
      //   const { from, to, $anchor, $head } = selection;

      //   if (selection instanceof TextSelection) {
      //     // single
      //     if (from === to) {
      //       if ($anchor.parentOffset !== 0) {
      //         return false;
      //       }

      //       const result = getNearestNode($anchor);

      //       // fix: throw an error here?
      //       if (!result) return true;

      //       const { node, depth } = result;

      //       // here we're working with a TextBasedNode, could be a paragraph-like or a cell

      //       if (isListNode(node)) {
      //         const node_bef = $anchor.before(depth);
      //         const node_aft = node_bef + node.nodeSize;

      //         const { paragraph } = editor.schema.nodes;

      //         tr.setBlockType(node_bef, node_aft, paragraph, {
      //           ...node.attrs,
      //           contentType: "paragraph",
      //         });

      //         dispatch(tr);

      //         return true;
      //       }

      //       // let the default behavior happen
      //       if (isCellNode(node)) {
      //         return false;
      //       }

      //       // text node, parent offset is 0, and is NOT a cell node

      //       if (parseInt(node.attrs.indentLevel) > 0) {
      //         const node_bef = $anchor.before(depth);
      //         const indentLevel = Math.max(node.attrs.indentLevel - 1, 0);

      //         tr.setNodeAttribute(node_bef, "indentLevel", indentLevel);

      //         dispatch(tr);

      //         return true;
      //       }

      //       const node_bef = $anchor.before(depth);
      //       const node_aft = node_bef + node.nodeSize;
      //       const prevBlock = tr.doc.resolve(node_bef).nodeBefore;

      //       // fix: need to be able to edit the title of the note?
      //       if (!prevBlock) return true;

      //       if (prevBlock.type.name === "table") {
      //         const pos = node_bef - 4;

      //         tr.delete(node_bef, node_aft)
      //           .insert(pos, node.content)
      //           .setSelection(TextSelection.create(tr.doc, pos));

      //         dispatch(tr);

      //         return true;
      //       }

      //       if (!prevBlock.isTextblock) {
      //         const prev_bef = node_bef - prevBlock.nodeSize;
      //         const prev_aft = node_bef;

      //         tr.setSelection(
      //           MultiSelection.create(tr.doc, prev_bef, prev_aft),
      //         );

      //         dispatch(tr);

      //         return true;
      //       }

      //       return false;
      //     }

      //     // ranged
      //     if (from !== to) {
      //       handleBadSelection(tr, from, to);

      //       const pos = tr.mapping.map($head.pos);

      //       // if both are TextBasedNodes, then I should be able to get the both the before and after node
      //       // ranged deletion will always cause the caret to be at the end of first node if it's a text node
      //       // I can therefore +1 to get the after of the first node and figure out the before and after nodes
      //       const resolvedAfter = tr.doc.resolve(pos + 1);
      //       const { nodeBefore, nodeAfter } = resolvedAfter;

      //       if (nodeBefore?.isTextblock && nodeAfter?.isTextblock) {
      //         const combined = nodeBefore.content.append(nodeAfter.content);
      //         const combinedNode = nodeBefore.copy(combined);

      //         tr.delete(
      //           resolvedAfter.pos,
      //           resolvedAfter.pos + nodeAfter.nodeSize,
      //         ).replaceWith(
      //           resolvedAfter.pos - nodeBefore.nodeSize,
      //           resolvedAfter.pos,
      //           combinedNode,
      //         );
      //       }

      //       const near = TextSelection.near(tr.doc.resolve(pos));
      //       tr.setSelection(near);
      //       tr.setMeta("pressedKey", "backspace"); // idea

      //       dispatch(tr);

      //       return true;
      //     }
      //   }

      //   // cell selection

      //   // multi block selection
      // },

      // Enter: ({ editor }) => {
      //   const { selection, tr } = editor.state;
      //   const { dispatch } = editor.view;
      //   const { from, $from, to, $anchor } = selection;

      //   if (selection instanceof TextSelection) {
      //     if (from === to) {
      //       const result = getNearestNode($anchor);

      //       // fix: throw error?
      //       if (!result) return true;

      //       const { node, depth } = result;

      //       // outdent
      //       if (
      //         node.content.size === 0 &&
      //         $from.parentOffset === 0 &&
      //         node.attrs.indentLevel > 0 &&
      //         isListNode(node)
      //       ) {
      //         const node_bef = $from.before(depth);
      //         const level = Math.max(node.attrs.indentLevel - 1, 0);

      //         dispatch(tr.setNodeAttribute(node_bef, "indentLevel", level));

      //         return true;
      //       }

      //       // revert to paragraph
      //       if (
      //         node.content.size === 0 &&
      //         $from.parentOffset === 0 &&
      //         node.attrs.indentLevel === 0 &&
      //         node.type.name !== "paragraph"
      //       ) {
      //         const node_bef = $from.before(depth);
      //         const node_aft = node_bef + node.nodeSize;
      //         const { paragraph } = editor.schema.nodes;

      //         dispatch(
      //           tr.setBlockType(node_bef, node_aft, paragraph, {
      //             nodeType: "block",
      //             contentType: "paragraph",
      //             indentLevel: 0,
      //           }),
      //         );

      //         return true;
      //       }

      //       if (isCellNode(node)) {
      //         const { node: tableNode, depth: tableDepth } =
      //           getNodeByContentType($anchor, "table");
      //         const tableBefore = $anchor.before(tableDepth);
      //         const tableMap = getTableMap(tableNode, tableBefore);

      //         const cell_bef = $anchor.before(depth) + 1;
      //         const cell_dom = editor.view.domAtPos(cell_bef);
      //         if (!cell_dom.node) return true;
      //         const cellIndex = cell_dom?.node.cellIndex;
      //         const rowIndex = cell_dom?.node.parentNode.rowIndex;
      //         const targetRow = tableMap.grid[rowIndex + 1];

      //         // fix: not sure about this
      //         if (!targetRow) {
      //           const tableAfter = tableBefore + tableNode.nodeSize;
      //           const resolvedPos = tr.doc.resolve(tableAfter);
      //           const nodeAfter = resolvedPos.nodeAfter;

      //           if (!nodeAfter) return true;

      //           if (nodeAfter.isTextblock) {
      //             tr.setSelection(TextSelection.create(tr.doc, tableAfter + 1));
      //             dispatch(tr);

      //             return true;
      //           } else {
      //             tr.setSelection(
      //               MultiSelection.create(
      //                 tr.doc,
      //                 tableAfter,
      //                 tableAfter + nodeAfter.nodeSize,
      //               ),
      //             );
      //             dispatch(tr);

      //             return true;
      //           }
      //         }

      //         const targetCell = targetRow[cellIndex];

      //         tr.setSelection(TextSelection.create(tr.doc, targetCell.pos + 2));
      //         dispatch(tr);

      //         return true;
      //       }

      //       // basic enter
      //       const node_bef = $from.before(depth);
      //       const node_aft = node_bef + node.nodeSize;

      //       const nextContent = node.content.cut(
      //         $from.parentOffset,
      //         node.content.size,
      //       );

      //       const attrs = {};
      //       Object.entries(node.attrs).forEach((entry) => {
      //         const key = entry[0];
      //         const value = entry[1];

      //         if (key !== "id") {
      //           attrs[key] = value;
      //         }
      //       });

      //       const nextNode = editor.schema.nodes[node.type.name].create(
      //         { ...attrs },
      //         nextContent,
      //       );

      //       tr.insert(node_aft, nextNode)
      //         .setSelection(TextSelection.create(tr.doc, node_aft + 1))
      //         .delete(from, node_aft);

      //       dispatch(tr);

      //       return true;
      //     }

      //     if (from !== to) {
      //       handleBadSelection(tr, from, to);

      //       const pos = tr.mapping.map(from);
      //       const near = TextSelection.near(tr.doc.resolve(pos));
      //       tr.setSelection(near);
      //       tr.setMeta("pressedKey", "enter");

      //       dispatch(tr);

      //       return true;
      //     }
      //   }

      //   if (selection instanceof MultiSelection) return true;

      //   return false;
      // },

      // Tab: ({ editor }) => {
      //   const { selection, tr } = editor.state;
      //   const { dispatch } = editor.view;
      //   const { from, $from, to, $anchor } = selection;

      //   if (selection instanceof TextSelection) {
      //     if (from === to) {
      //       const result = getNearestNode($anchor);
      //       if (!result) return true; // fix: throw error?

      //       const { node, depth } = result;

      //       // indent-able
      //       if (node.attrs.indentLevel >= 0) {
      //         const node_bef = $from.before(depth);
      //         const level = Math.min(parseInt(node.attrs.indentLevel) + 1, 12);

      //         tr.setNodeAttribute(node_bef, "indentLevel", level);

      //         dispatch(tr);
      //       }

      //       // cell node
      //       if (isCellNode(node)) {
      //         const { node: tableNode, depth: tableDepth } =
      //           getNodeByContentType($anchor, "table");

      //         const tableBefore = $anchor.before(tableDepth);
      //         const tableMap = getTableMap(tableNode, tableBefore);

      //         const cell_bef = $anchor.before(depth) + 1;
      //         const cell_dom = editor.view.domAtPos(cell_bef);

      //         if (!cell_dom.node) return true;

      //         const { grid } = tableMap;
      //         const cellIndex = cell_dom?.node.cellIndex + 1;
      //         const rowIndex = cell_dom?.node.parentNode.rowIndex;
      //         const maxIndex = cell_dom?.node.parentNode.children.length - 1;

      //         if (cellIndex <= maxIndex) {
      //           const row = grid[rowIndex];
      //           const nextCell = row[cellIndex];

      //           if (!nextCell) return true;

      //           tr.setSelection(TextSelection.create(tr.doc, nextCell.pos + 2));

      //           dispatch(tr);
      //         }

      //         if (cellIndex > maxIndex) {
      //           const nextRowIndex = rowIndex + 1;

      //           const row = grid[nextRowIndex];
      //           if (!row) return true;

      //           const nextCell = row[0];
      //           if (!nextCell) return true;

      //           tr.setSelection(TextSelection.create(tr.doc, nextCell.pos + 2));
      //           tr.scrollIntoView(); // fix: enter probably needs this as well

      //           dispatch(tr);
      //         }
      //       }

      //       return true;
      //     }

      //     if (from !== to) {
      //       tr.doc.nodesBetween(from, to, (node, pos) => {
      //         if (
      //           node.attrs.nodeType === "block" &&
      //           node.attrs.indentLevel >= 0
      //         ) {
      //           const level = Math.min(
      //             parseInt(node.attrs.indentLevel) + 1,
      //             12,
      //           );

      //           tr.setNodeAttribute(pos, "indentLevel", level);

      //           return false;
      //         }
      //       });

      //       dispatch(tr);

      //       return true;
      //     }
      //   }

      //   if (selection instanceof MultiSelection) {
      //     selection.positions((position, i) => {
      //       const node = selection.blocks[i];
      //       const { before } = position;

      //       const level = Math.min(parseInt(node.attrs.indentLevel) + 1, 12);

      //       tr.setNodeAttribute(before, "indentLevel", level);
      //     });

      //     return true;
      //   }

      //   return true;
      // },

      // "Shift-Tab": ({ editor }) => {
      //   const { selection, tr } = editor.state;
      //   const { dispatch } = editor.view;
      //   const { from, $from, to, $anchor } = selection;

      //   if (selection instanceof TextSelection) {
      //     if (from === to) {
      //       const result = getNearestNode($anchor);
      //       if (!result) return true; // fix: throw error?

      //       const { node, depth } = result;

      //       // indent-able
      //       if (node.attrs.indentLevel >= 0) {
      //         const node_bef = $from.before(depth);
      //         const level = Math.max(parseInt(node.attrs.indentLevel) - 1, 0);

      //         tr.setNodeAttribute(node_bef, "indentLevel", level);

      //         dispatch(tr);
      //       }

      //       // cell node
      //       if (isCellNode(node)) {
      //         const { node: tableNode, depth: tableDepth } =
      //           getNodeByContentType($anchor, "table");

      //         const tableBefore = $anchor.before(tableDepth);
      //         const tableMap = getTableMap(tableNode, tableBefore);

      //         const cell_bef = $anchor.before(depth) + 1;
      //         const cell_dom = editor.view.domAtPos(cell_bef);

      //         if (!cell_dom.node) return true;

      //         const { grid } = tableMap;
      //         const prevCellIndex = cell_dom?.node.cellIndex - 1;
      //         const rowIndex = cell_dom?.node.parentNode.rowIndex;

      //         if (prevCellIndex >= 0) {
      //           const row = grid[rowIndex];
      //           const prevCell = row[prevCellIndex];

      //           if (!prevCell) return true;

      //           tr.setSelection(TextSelection.create(tr.doc, prevCell.pos + 2));

      //           dispatch(tr);
      //         }

      //         if (prevCellIndex < 0) {
      //           // fix: fix name
      //           const prevRowIndex = rowIndex - 1;

      //           const row = grid[prevRowIndex];
      //           if (!row) return true;

      //           const rowMaxIndex = row.length - 1;
      //           const prevCell = row[rowMaxIndex];
      //           if (!prevCell) return true;

      //           tr.setSelection(TextSelection.create(tr.doc, prevCell.pos + 2));
      //           tr.scrollIntoView(); // fix: enter probably needs this as well

      //           dispatch(tr);
      //         }
      //       }

      //       return true;
      //     }

      //     if (from !== to) {
      //       tr.doc.nodesBetween(from, to, (node, pos) => {
      //         if (
      //           node.attrs.nodeType === "block" &&
      //           node.attrs.indentLevel >= 0
      //         ) {
      //           const level = Math.max(parseInt(node.attrs.indentLevel) - 1, 0);

      //           tr.setNodeAttribute(pos, "indentLevel", level);

      //           return false;
      //         }
      //       });

      //       dispatch(tr);

      //       return true;
      //     }
      //   }

      //   if (selection instanceof MultiSelection) {
      //     selection.positions((position, i) => {
      //       const node = selection.blocks[i];
      //       const { before } = position;

      //       const level = Math.max(parseInt(node.attrs.indentLevel) - 1, 0);

      //       tr.setNodeAttribute(before, "indentLevel", level);
      //     });

      //     return true;
      //   }

      //   return true;
      // },

      Backspace: () => {
        console.log("backspace");
        return false;
      },

      // fix: feel like this should be global
      "Mod-a": ({ editor }) => {
        const { tr } = editor.state;
        const { dispatch } = editor.view;

        // const sel = MultiSelection.create(tr.doc, 0, tr.doc.content.size);
        const sel = TextSelection.create(tr.doc, 0, tr.doc.content.size);

        tr.setSelection(sel);
        dispatch(tr);
        return true;
      },
    };
  },
});
