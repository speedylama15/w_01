import { TableView } from "@tiptap/extension-table";

class m_TableView extends TableView {
  createBlock(HTMLAttributes) {
    const block = document.createElement("div");

    block.className = "block block-table";

    Object.entries(HTMLAttributes).forEach((entry) => {
      const key = entry[0];
      const value = entry[1];

      block.setAttribute(key, value);
    });

    return block;
  }

  createContent() {
    const content = document.createElement("div");

    content.className = "content content-table";

    return content;
  }

  createContentWrapper() {
    const contentWrapper = document.createElement("div");

    contentWrapper.className = "contentWrapper";

    return contentWrapper;
  }

  createTableWrapper() {
    const tableWrapper = document.createElement("div");

    tableWrapper.className = "tableWrapper";

    return tableWrapper;
  }

  createSelectionBox() {
    const tableSelectionBox = document.createElement("div");
    tableSelectionBox.className = "table-selection-box";

    const tableCellButton = document.createElement("button");
    tableCellButton.className = "table-cell-button";

    tableSelectionBox.append(tableCellButton);

    return tableSelectionBox;
  }

  createColumnButton(tableID) {
    const button = document.createElement("button");

    button.className = "table-button table-column-button";

    button.contentEditable = false;

    button.setAttribute("data-is-column", true);
    button.setAttribute("data-from-index", null);
    button.setAttribute("data-table-id", tableID);

    return button;
  }

  createRowButton(tableID) {
    const button = document.createElement("button");

    button.className = "table-button table-row-button";

    button.contentEditable = false;

    button.setAttribute("data-is-column", false);
    button.setAttribute("data-from-index", null);
    button.setAttribute("data-table-id", tableID);

    return button;
  }

  constructor(node, cellMinWidth, view, getPos, HTMLAttributes) {
    super(node, cellMinWidth);

    const block = this.createBlock(HTMLAttributes);
    const content = this.createContent();
    const contentWrapper = this.createContentWrapper();
    const tableWrapper = this.createTableWrapper();

    block.append(content);
    content.append(contentWrapper);
    contentWrapper.append(tableWrapper);

    const rowButton = this.createRowButton(HTMLAttributes["data-id"]);

    contentWrapper.append(rowButton);

    const selectionBox = this.createSelectionBox();
    const columnButton = this.createColumnButton(HTMLAttributes["data-id"]);

    tableWrapper.append(this.table, selectionBox, columnButton);

    console.log(node, this.table, this.colgroup);

    // this.colgroup col elements without the width property
    const count = node.content.content[0].content.content.length;

    this.table.style.width = count * cellMinWidth + "px";
    this.table.style.minWidth = count * cellMinWidth + "px";

    this.dom = block;
  }

  // update(node) {
  //   console.log("update inside of TableView", node);
  // }

  // update(node) {
  //   if (node.type != this.node.type) return false;
  //   this.node = node;
  //   updateColumnsOnResize(
  //     node,
  //     this.colgroup,
  //     this.table,
  //     this.defaultCellMinWidth,
  //   );
  //   return true;
  // }

  // ignoreMutation(record) {
  //   return (
  //     record.type == "attributes" &&
  //     (record.target == this.table || this.colgroup.contains(record.target))
  //   );
  // }
}

export default m_TableView;

// review: return true -> Keep instance and update the existing DOM
// review: return false -> Destroy and recreate everything from scratch
// update(node, decorations, innerDecorations) {
//   // update method does not have access to the editor...
//   // maybe I can make use of state? Bring in the state? // idea

//   // it needs to be able to know if the selection is Cell or Text
//   // but update() does not have access to the most up to date selection... // fix

//   return true;
// }

// review: return true = Ignore this DOM change - ProseMirror won't try to reparse it
// review: return false = Handle this DOM change - ProseMirror will reparse and potentially update the document
// Use true for mutations you caused yourself (like updating <col> widths) to prevent ProseMirror from interfering.
// ignoreMutation() {
//   return true;
// }

/**
 * @public
 */
export function updateColumnsOnResize(
  node,
  colgroup,
  table,
  defaultCellMinWidth,
  overrideCol,
  overrideValue,
) {
  let totalWidth = 0;
  let fixedWidth = true;
  let nextDOM = colgroup.firstChild;
  const row = node.firstChild;
  if (!row) return;

  for (let i = 0, col = 0; i < row.childCount; i++) {
    const { colspan, colwidth } = row.child(i).attrs;
    for (let j = 0; j < colspan; j++, col++) {
      const hasWidth =
        overrideCol == col ? overrideValue : colwidth && colwidth[j];
      const cssWidth = hasWidth ? hasWidth + "px" : "";
      totalWidth += hasWidth || defaultCellMinWidth;
      if (!hasWidth) fixedWidth = false;
      if (!nextDOM) {
        const col = document.createElement("col");
        col.style.width = cssWidth;
        colgroup.appendChild(col);
      } else {
        if (nextDOM.style.width != cssWidth) {
          nextDOM.style.width = cssWidth;
        }
        nextDOM = nextDOM.nextSibling;
      }
    }
  }

  while (nextDOM) {
    const after = nextDOM.nextSibling;
    nextDOM.parentNode?.removeChild(nextDOM);
    nextDOM = after;
  }

  if (fixedWidth) {
    table.style.width = totalWidth + "px";
    table.style.minWidth = "";
  } else {
    table.style.width = "";
    table.style.minWidth = totalWidth + "px";
  }
}
