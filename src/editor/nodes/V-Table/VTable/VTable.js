// import { Node, mergeAttributes } from "@tiptap/core";
// import { Fragment } from "@tiptap/pm/model";
// import { NodeSelection, Plugin, PluginKey } from "@tiptap/pm/state";
// import { Decoration, DecorationSet } from "@tiptap/pm/view";

// import getNearestTableDepth from "../utils/getNearestTableDepth";
// import getTableAndRowMap from "../utils/getTableAndRowMap";

// import "./VTable.css";

// const name = "vTable";
// const cellSelectionKey = new PluginKey("cell-selection");

// const VTable = Node.create({
//   name,
//   group: "block",
//   content: "vBody+",

//   addNodeView(params) {
//     // idea: maybe I can use this section?

//     return ({
//       HTMLAttributes,
//       decorations,
//       editor,
//       view,
//       node,
//       getPos,
//       extension,
//       innerDecorations,
//     }) => {
//       const vBody = node.firstChild;
//       const vRow = vBody.firstChild;

//       //
//       const block = document.createElement("div");
//       block.classList.add("block", "block-vTable");
//       Object.entries(HTMLAttributes).forEach((attribute) => {
//         block.setAttribute(attribute[0], attribute[1]);
//       });
//       //

//       //
//       const content = document.createElement("div");
//       content.classList.add("content", "content-vTable");
//       //

//       //
//       const tableWrapper = document.createElement("div");
//       tableWrapper.classList.add("table-wrapper");
//       //

//       //
//       const table = document.createElement("table");
//       //

//       //
//       let tableWidth = 0;
//       const colgroup = document.createElement("colgroup");
//       vRow.children.forEach((vCell) => {
//         const colwidth = node.attrs.colwidth;
//         const col = document.createElement("col");
//         col.style.width = `${colwidth}px`;
//         col.style.minWidth = "150px";
//         colgroup.append(col);

//         tableWidth += colwidth;
//       });
//       //

//       block.append(content);
//       content.append(tableWrapper);
//       tableWrapper.append(table);
//       table.append(colgroup);

//       return {
//         dom: block,
//         contentDOM: table,
//         ignoreMutation() {
//           return true;
//         },
//         stopEvent() {},
//         update(updatedNode) {
//           return true;
//         },
//         destroy: () => {},
//       };
//     };
//   },

//   addProseMirrorPlugins() {
//     return [
//       new Plugin({
//         key: cellSelectionKey,

//         state: {
//           init(config, editorState) {
//             return DecorationSet.empty;
//           },

//           apply(tr, oldDecoSet) {
//             const meta = tr.getMeta(cellSelectionKey);

//             return oldDecoSet.map(tr.mapping, tr.doc);
//           },
//         },

//         view(editorView) {
//           return {
//             update(view, prevState) {},

//             destroy() {},
//           };
//         },

//         props: {
//           decorations(state) {
//             return cellSelectionKey.getState(state);
//           },

//           handleClick(view, pos, e) {},

//           handleKeyDown(view, event) {},
//         },
//       }),
//     ];
//   },

//   addOptions() {
//     return {
//       blockAttrs: { class: `block block-${name}` },
//       contentAttrs: {
//         class: `content content-${name}`,
//       },
//     };
//   },

//   addKeyboardShortcuts() {
//     return {
//       "=": ({ editor }) => {
//         const { from } = editor.state.selection;
//         const { tr } = editor.state;
//         const { dispatch } = editor.view;

//         const cells = [];
//         const rows = [];

//         for (let i = 0; i < 9; i++) {
//           const checkbox = editor.schema.nodes.vCheckboxItem.create();
//           const paragraph = editor.schema.nodes.vParagraphItem.create();
//           const content = i === 0 ? checkbox : paragraph;

//           const cell = editor.schema.nodes.vCell.create({}, content);

//           cells.push(cell);
//         }

//         for (let i = 0; i < 5; i++) {
//           const row = editor.schema.nodes.vRow.create({}, Fragment.from(cells));
//           rows.push(row);
//         }

//         const body = editor.schema.nodes.vBody.create({}, Fragment.from(rows));
//         const tableNode = editor.schema.nodes.vTable.create(
//           {},
//           Fragment.from(body)
//         );

//         tr.insert(from, tableNode);
//         dispatch(tr);

//         return true;
//       },
//     };
//   },

//   addAttributes() {
//     return {
//       contentType: {
//         default: name,
//         parseHTML: (element) => element.getAttribute("data-content-type"),
//         renderHTML: (attributes) => ({
//           "data-content-type": attributes.contentType,
//         }),
//       },
//       indentLevel: {
//         default: 0,
//         parseHTML: (element) => element.getAttribute("data-indent-level"),
//         renderHTML: (attributes) => ({
//           "data-indent-level": attributes.indentLevel,
//         }),
//       },
//       nodeType: {
//         default: "block",
//         parseHTML: (element) => element.getAttribute("data-node-type"),
//         renderHTML: (attributes) => ({
//           "data-node-type": attributes.nodeType,
//         }),
//       },
//     };
//   },

//   parseHTML() {
//     return [{ tag: `div[data-content-type="${name}"]` }, { tag: "table" }];
//   },

//   renderHTML({ HTMLAttributes }) {
//     return [
//       "div",
//       mergeAttributes(HTMLAttributes, this.options.blockAttrs),
//       ["div", this.options.contentAttrs, ["table", {}, 0]],
//     ];
//   },
// });

// export default VTable;

import { Node, mergeAttributes } from "@tiptap/core";
import { Fragment } from "@tiptap/pm/model";
import { NodeSelection, Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

import getNearestTableDepth from "../utils/getNearestTableDepth";
import getTableAndRowMap from "../utils/getTableAndRowMap";

import {
  createBlockDOM,
  createContentDOM,
  createTableWrapperDOM,
  createTableDOM,
  createColumnResizerDOM,
} from "../utils/createDOMElements";

import "./VTable.css";

const name = "vTable";
const cellSelectionKey = new PluginKey("cell-selection");

function createOverlayBox() {
  const overlayBox = document.createElement("div");
  overlayBox.className = "overlay-box";
  overlayBox.style.display = "none";
  overlayBox.setAttribute("contenteditable", "false");

  const columnBtn = document.createElement("div");
  columnBtn.className = "column-button";
  columnBtn.setAttribute("contenteditable", "false");

  const rowBtn = document.createElement("div");
  rowBtn.className = "row-button";
  rowBtn.setAttribute("contenteditable", "false");

  const cellBtn = document.createElement("div");
  const btn = document.createElement("button");
  btn.textContent = "+";
  cellBtn.append(btn);
  cellBtn.className = "cell-button";
  cellBtn.setAttribute("contenteditable", "false");

  overlayBox.appendChild(columnBtn);
  overlayBox.appendChild(rowBtn);
  overlayBox.appendChild(cellBtn);

  return { overlayBox, columnBtn, rowBtn, cellBtn };
}

const VTable = Node.create({
  name,
  group: "block",
  content: "vRow+",

  addNodeView(params) {
    // maybe I can use this section?

    return ({
      HTMLAttributes,
      decorations,
      editor,
      view,
      node,
      getPos,
      extension,
      innerDecorations,
    }) => {
      // debug
      const cellNumber =
        node.firstChild.type.name === "vRow"
          ? node.firstChild.children.length
          : "something is not right";
      if (cellNumber === "something is not right") return;
      // debug

      const block = createBlockDOM(HTMLAttributes);
      const content = createContentDOM();
      const tableWrapper = createTableWrapperDOM();
      const { table, tbody } = createTableDOM(node);
      const columnResizer = createColumnResizerDOM();
      const { overlayBox, columnBtn, rowBtn, cellBtn } = createOverlayBox();

      block.append(content);
      content.append(tableWrapper);
      tableWrapper.append(table);
      tableWrapper.append(columnResizer);
      tableWrapper.append(overlayBox);

      // idea: isDragging is true -> change cursor for document.body
      // todo: when a note is loaded, this plugin needs to run through all the table and establish a map
      // todo: when updates occur, I need to find the table/s that was/were updated
      let tableStartWidth = null;
      let resizerStartX = null;
      let resizerStartLeft = null;
      let resizedCol = null;
      let colStartWidth = null;
      const resizerMetadata = {
        direction: null,
        rIndex: null,
        lIndex: null,
      };

      // idea: editor.commands.blur();
      // IDEA: maybe I need to use a plugin state
      let isDragging = false;

      // todo
      const handleCellBtnClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const cellBtnDropdown = document.createElement("div");
        cellBtnDropdown.className = "cell-btn_dropdown";

        const cellBackground = document.createElement("button");
        cellBackground.textContent = "Change background";
        const cellTextColor = document.createElement("button");
        cellTextColor.textContent = "Change color";
        const cellItemType = document.createElement("button");
        cellItemType.textContent = "Change item type";

        cellBtnDropdown.append(cellBackground, cellTextColor, cellItemType);
        cellBtn.append(cellBtnDropdown);
      };
      // todo

      const handleDocumentMouseDown = (e) => {
        const td = e.target.closest("td");

        if (td) {
          const { dispatch } = editor.view;
          const { tr } = editor.state;

          const pos = editor.view.posAtDOM(td);
          const node = editor.state.doc.nodeAt(pos);

          if (node.type.name === "vCheckboxItem") {
            const isChecked = node.attrs.isChecked;

            tr.setNodeAttribute(
              pos,
              "isChecked",
              isChecked === "true" ? "false" : "true"
            );

            dispatch(tr);
          }

          overlayBox.style.cssText = `
            display: block;
            top: ${td.offsetTop}px;
            left: ${td.offsetLeft}px;
            width: ${td.offsetWidth + 1}px;
            height: ${td.offsetHeight + 1}px;
            position: absolute;
            border: 3px solid blue;
          `;
        }
      };

      const handleDocumentMouseUp = (e) => {};

      document.addEventListener("mouseup", handleDocumentMouseUp);
      table.addEventListener("mousedown", handleDocumentMouseDown);
      cellBtn.addEventListener("click", handleCellBtnClick);

      table.addEventListener("mousedown", (e) => {});

      table.addEventListener("mousemove", (e) => {
        if (isDragging) return;

        const cell = e.target.closest("td");

        if (!cell) return;

        const rect = cell.getBoundingClientRect();

        // left
        if (
          e.clientX - rect.left <= 2.5 &&
          e.clientX - rect.left >= 0 &&
          cell.cellIndex !== 0
        ) {
          columnResizer.style.display = "block";
          columnResizer.style.left = cell.offsetLeft + "px";

          resizerMetadata.direction = "left";
          resizerMetadata.rIndex = cell.cellIndex;
          resizerMetadata.lIndex = cell.cellIndex - 1;

          return;
        }

        // right
        if (rect.right - e.clientX <= 2.5 && rect.right - e.clientX >= 0) {
          columnResizer.style.display = "block";
          columnResizer.style.left = cell.offsetLeft + cell.offsetWidth + "px";

          resizerMetadata.direction = "right";
          resizerMetadata.lIndex = cell.cellIndex;
          resizerMetadata.rIndex = cell.cellIndex + 1;

          return;
        }

        columnResizer.style.display = "none";

        resizerMetadata.direction = null;
        resizerMetadata.lIndex = null;
        resizerMetadata.rIndex = null;
      });

      columnResizer.addEventListener("mousedown", (e) => {
        e.stopPropagation();

        const cols = table.querySelectorAll("col");

        document.body.style.userSelect = "none";

        isDragging = true;
        resizerStartX = e.clientX;
        resizerStartLeft = parseFloat(columnResizer.style.left);
        resizedCol = cols[resizerMetadata.lIndex];
        colStartWidth = parseFloat(resizedCol.style.width);
        tableStartWidth = parseFloat(table.style.minWidth);

        document.addEventListener("mousemove", onResizerMove);
        document.addEventListener("mouseup", onResizerUp);
      });

      function onResizerMove(e) {
        if (!isDragging) return;

        // review
        document.body.style.cursor = "col-resize";

        const diff = e.pageX - resizerStartX;
        const newColWidth = colStartWidth + diff;

        const MIN_WIDTH = 150;
        const clampedWidth = Math.max(MIN_WIDTH, newColWidth);

        const clampedDiff = clampedWidth - colStartWidth;

        table.style.minWidth = tableStartWidth + clampedDiff + "px";
        columnResizer.style.left = resizerStartLeft + clampedDiff + "px";
        resizedCol.style.width = clampedWidth + "px";
      }

      function onResizerUp() {
        const tableNode = editor.state.tr.doc.nodeAt(getPos());
        const { tableMap, rowMap } = getTableAndRowMap(tableNode, getPos());
        const index = resizerMetadata.lIndex;
        const values = Object.values(tableMap);

        document.body.style.cursor = "";

        const { tr } = editor.state;
        const { dispatch } = editor.view;

        for (let i = 0; i < values.length; i++) {
          const cellNode = values[i][index];

          tr.setNodeAttribute(
            cellNode.pos,
            "colwidth",
            parseFloat(resizedCol.style.width)
          );
        }

        dispatch(tr);

        isDragging = false;
        resizerStartX = null;
        resizerStartLeft = null;
        resizedCol = null;
        colStartWidth = null;
        resizerMetadata.direction = null;
        resizerMetadata.lIndex = null;
        resizerMetadata.rIndex = null;

        columnResizer.style.display = "none";
        document.body.style.userSelect = "";
        table.style.pointerEvents = "";

        document.removeEventListener("mousemove", onResizerMove);
        document.removeEventListener("mouseup", onResizerUp);
      }

      return {
        dom: block,
        contentDOM: tbody,
        ignoreMutation() {
          return true;
        },
        stopEvent() {},
        update(updatedNode) {
          return true;
        },
        destroy: () => {
          document.removeEventListener("mouseup", handleDocumentMouseUp);
          table.removeEventListener("mousedown", handleDocumentMouseDown);
          cellBtn.removeEventListener("click", handleCellBtnClick);
        },
      };
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: cellSelectionKey,

        state: {
          init(config, editorState) {
            return DecorationSet.empty;
          },

          apply(tr, oldDecoSet) {
            const meta = tr.getMeta(cellSelectionKey);

            return oldDecoSet.map(tr.mapping, tr.doc);
          },
        },

        view(editorView) {
          return {
            update(view, prevState) {},

            destroy() {},
          };
        },

        props: {
          decorations(state) {
            return cellSelectionKey.getState(state);
          },

          handleClick(view, pos, e) {},

          handleKeyDown(view, event) {},
        },
      }),
    ];
  },

  addOptions() {
    return {
      blockAttrs: { class: `block block-${name}` },
      contentAttrs: {
        class: `content content-${name}`,
      },
    };
  },

  addKeyboardShortcuts() {
    return {
      "=": ({ editor }) => {
        const { from } = editor.state.selection;
        const { tr } = editor.state;
        const { dispatch } = editor.view;

        const cells = [];
        const rows = [];

        for (let i = 0; i < 9; i++) {
          const checkbox = editor.schema.nodes.vCheckboxItem.create();
          const paragraph = editor.schema.nodes.vParagraphItem.create();

          const cell = editor.schema.nodes.vCell.create(
            {},
            i === 0 ? checkbox : paragraph
          );

          cells.push(cell);
        }

        for (let i = 0; i < 5; i++) {
          const row = editor.schema.nodes.vRow.create({}, Fragment.from(cells));
          rows.push(row);
        }

        const tableNode = editor.schema.nodes.vTable.create(
          {},
          Fragment.from(rows)
        );

        tr.insert(from, tableNode);

        dispatch(tr);

        return true;
      },
    };
  },

  addAttributes() {
    return {
      contentType: {
        default: name,
        parseHTML: (element) => element.getAttribute("data-content-type"),
        renderHTML: (attributes) => ({
          "data-content-type": attributes.contentType,
        }),
      },
      indentLevel: {
        default: 0,
        parseHTML: (element) => element.getAttribute("data-indent-level"),
        renderHTML: (attributes) => ({
          "data-indent-level": attributes.indentLevel,
        }),
      },
      nodeType: {
        default: "block",
        parseHTML: (element) => element.getAttribute("data-node-type"),
        renderHTML: (attributes) => ({
          "data-node-type": attributes.nodeType,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: `div[data-content-type="${name}"]` }, { tag: "table" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, this.options.blockAttrs),
      ["div", this.options.contentAttrs, ["table", {}, 0]],
    ];
  },
});

export default VTable;
