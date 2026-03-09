import { Extension } from "@tiptap/core";

import { TextSelection } from "@tiptap/pm/state";

import { getDepthByNodeType } from "../utils/depth/getDepthByNodeType";

// fix: when setting selection, make sure that its a valid position
// review: check for selection instance -> Text/MultiBlock/Cell

export const KeyboardShortcuts = Extension.create({
  name: "keyboardShortcuts",

  addKeyboardShortcuts() {
    return {
      // review: backspace
      Backspace: ({ editor }) => {
        const { selection, tr } = editor.state;
        const { dispatch } = editor.view;
        const { from, $from, to } = selection;

        console.log(selection);

        // text selection, single, and offset is 0
        if (
          selection instanceof TextSelection &&
          from === to &&
          $from.parentOffset === 0
        ) {
          const result = getDepthByNodeType($from, "block");

          if (!result) return true;

          const { depth, node } = result;

          // revert to paragraph
          if (
            node.type.name === "bulletList" ||
            node.type.name === "numberedList" ||
            node.type.name === "checklist"
          ) {
            const before = $from.before(depth);
            const after = before + node.nodeSize;

            dispatch(
              tr.setBlockType(before, after, editor.schema.nodes.paragraph, {
                nodeType: "block",
                contentType: "paragraph",
                indentLevel: node.attrs.indentLevel,
              }),
            );

            return true;
          }

          // outdent ONLY if indent is level is greater than 0
          if (node.type.name === "paragraph" && node.attrs.indentLevel > 0) {
            const pos = $from.before(depth);
            const level = Math.max(node.attrs.indentLevel - 1, 0);

            dispatch(tr.setNodeAttribute(pos, "indentLevel", level));

            return true;
          }
        }

        // let the default behavior occur
        return false;
      },

      // review: tab
      Tab: ({ editor }) => {
        const { selection, tr } = editor.state;
        const { dispatch } = editor.view;
        const { from, $from, to } = selection;

        if (selection instanceof TextSelection) {
          if (from === to) {
            const result = getDepthByNodeType($from, "block");

            if (!result) return true;

            const { depth, node } = result;

            const pos = $from.before(depth);
            const level = Math.min(parseInt(node.attrs.indentLevel) + 1, 12);

            tr.setNodeAttribute(pos, "indentLevel", level);

            dispatch(tr);

            return true;
          }

          if (from !== to) {
            tr.doc.nodesBetween(from, to, (node, pos) => {
              if (node.attrs.nodeType === "block") {
                const level = Math.min(
                  parseInt(node.attrs.indentLevel) + 1,
                  12,
                );

                tr.setNodeAttribute(pos, "indentLevel", level);

                return false;
              }
            });

            dispatch(tr);

            return true;
          }
        }

        // todo: MultiBlockSelection

        // todo: CellSelection

        return true;
      },

      // review: shift-tab
      "Shift-Tab": ({ editor }) => {
        const { selection, tr } = editor.state;
        const { dispatch } = editor.view;
        const { from, $from, to } = selection;

        if (selection instanceof TextSelection) {
          if (from === to) {
            const result = getDepthByNodeType($from, "block");

            if (!result) return true;

            const { depth, node } = result;

            const pos = $from.before(depth);
            const level = Math.max(parseInt(node.attrs.indentLevel) - 1, 0);

            dispatch(tr.setNodeAttribute(pos, "indentLevel", level));

            return true;
          }

          if (from !== to) {
            tr.doc.nodesBetween(from, to, (node, pos) => {
              if (node.attrs.nodeType === "block") {
                const level = Math.max(parseInt(node.attrs.indentLevel) - 1, 0);

                tr.setNodeAttribute(pos, "indentLevel", level);

                return false;
              }
            });

            dispatch(tr);

            return true;
          }
        }

        // todo: MultiBlockSelection

        // todo: CellSelection

        return true;
      },

      // review: Enter
      Enter: ({ editor }) => {
        const { selection, tr } = editor.state;
        const { dispatch } = editor.view;
        const { from, $from, to } = selection;

        if (selection instanceof TextSelection) {
          if (from === to) {
            const result = getDepthByNodeType($from, "block");

            if (!result) return true;

            const { depth, node } = result;

            // empty list offset 0, indent > 0 → outdent
            if (
              node.content.size === 0 &&
              $from.parentOffset === 0 &&
              node.attrs.indentLevel > 0 &&
              (node.type.name === "bulletList" ||
                node.type.name === "numberedList" ||
                node.type.name === "checklist")
            ) {
              const pos = $from.before(depth);
              const level = Math.max(node.attrs.indentLevel - 1, 0);

              dispatch(tr.setNodeAttribute(pos, "indentLevel", level));

              return true;
            }

            // empty list offset 0, indent = 0 → revert to paragraph
            if (
              node.content.size === 0 &&
              $from.parentOffset === 0 &&
              node.attrs.indentLevel === 0 &&
              (node.type.name === "bulletList" ||
                node.type.name === "numberedList" ||
                node.type.name === "checklist")
            ) {
              const before = $from.before(depth);
              const after = before + node.nodeSize;
              const paragraph = editor.schema.nodes.paragraph;

              dispatch(
                tr.setBlockType(before, after, paragraph, {
                  nodeType: "block",
                  contentType: "paragraph",
                  indentLevel: node.attrs.indentLevel,
                }),
              );

              return true;
            }

            // basic enter
            const before = $from.before(depth);
            const after = before + node.nodeSize;

            const nextContent = node.content.cut(
              $from.parentOffset,
              node.content.size,
            );
            const nextNode = editor.schema.nodes[node.type.name].create(
              { ...node.attrs },
              nextContent,
            );

            tr.insert(after, nextNode)
              .setSelection(TextSelection.create(tr.doc, after + 1))
              .delete(from, after);

            dispatch(tr);

            return true;
          }
        }

        // todo: multiblockselection, deleteRange and setSelection (cautious)
        // todo: cellSelection?
        // todo: TextSelection ranged, deleteRange and setSelection (cautious)

        return false;
      },
    };
  },
});
