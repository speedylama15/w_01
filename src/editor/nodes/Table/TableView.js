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

  createTableResizer() {
    const resizer = document.createElement("div");
    resizer.className = "table-resizer";

    const line = document.createElement("div");

    resizer.append(line);

    return resizer;
  }

  createSelectionBox() {
    const box = document.createElement("div");
    box.className = "selection-box";

    return box;
  }

  syncTableWidth(node, table, cellMinWidth) {
    const firstRow = node.firstChild;
    const cells = firstRow.children;

    let tableWidth = 0;

    cells.forEach((cell) => {
      const width = parseInt(cell.attrs.colwidth) || cellMinWidth;

      tableWidth += width;
    });

    table.style.width = tableWidth + "px";
    table.style.minWidth = tableWidth + "px";
  }

  syncColgroup(node, colgroup, cellMinWidth) {
    const cols = Array.from(colgroup.children);
    const domColCount = cols.length;

    const firstRow = node.firstChild;
    const nodeColumnCount = firstRow.children.length;

    // 3 - 5 = -2 -> need to remove 2 cols
    // 7 - 5 = 2 -> need to add 2 cols
    const count = nodeColumnCount - domColCount;

    // sync colgroup's length to node's column count
    if (count < 0) {
      // need to remove cols
      for (let i = 0; i < Math.abs(count); i++) {
        colgroup.lastElementChild.remove();
      }
    }
    if (count > 0) {
      // need to add cols
      for (let i = 0; i < Math.abs(count); i++) {
        const newCol = document.createElement("col");
        newCol.style.width = cellMinWidth + "px";
        newCol.style.minWidth = cellMinWidth + "px";

        colgroup.append(newCol);
      }
    }

    // loop and sync width/min-width to colwidth
    const cells = firstRow.children;
    Array.from(colgroup.children).forEach((col, i) => {
      const cellNode = cells[i];
      const colwidth = cellNode.attrs.colwidth || cellMinWidth;

      col.style.width = colwidth + "px";
      col.style.minWidth = cellMinWidth + "px";
    });

    return colgroup;
  }

  constructor(node, cellMinWidth, view, getPos, HTMLAttributes) {
    super(node, cellMinWidth);

    this.syncTableWidth(node, this.table, cellMinWidth);
    this.syncColgroup(node, this.colgroup, cellMinWidth);

    const block = this.createBlock(HTMLAttributes);
    const content = this.createContent();
    const contentWrapper = this.createContentWrapper();
    const tableWrapper = this.createTableWrapper();
    const tableResizer = this.createTableResizer();
    const selectionBox = this.createSelectionBox();

    block.append(content);
    content.append(contentWrapper);
    contentWrapper.append(tableWrapper);
    tableWrapper.append(this.table, tableResizer, selectionBox);

    this.dom = block;
    this.selectionBox = selectionBox;
  }

  // TODO: make sure that the syncing is not getting spammed
  update(node) {
    // not sure how this can happen, but it can happen
    if (node.type != this.node.type) return false;

    this.node = node;

    this.syncTableWidth(node, this.table, this.cellMinWidth);
    this.syncColgroup(node, this.colgroup, this.cellMinWidth);

    return true;
  }

  ignoreMutation(mutation) {
    if (
      mutation.type == "attributes" &&
      mutation.target === this.selectionBox
    ) {
      return true;
    }

    // idea: this is how Prosemirror handles ignoreMutation()
    return (
      mutation.type == "attributes" &&
      (mutation.target == this.table || this.colgroup.contains(mutation.target))
    );
  }
}

export default m_TableView;
