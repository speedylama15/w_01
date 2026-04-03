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

  getTableWidth(node) {
    let tableWidth = 0;

    const row = node.firstChild;

    row.content.content.forEach(
      (cell) => (tableWidth += parseInt(cell.attrs.colwidth)),
    );

    return tableWidth;
  }

  setInitColgroup(node, colgroup, cellMinWidth) {
    const cols = Array.from(colgroup.children);

    node.firstChild.content.content.forEach((cell, i) => {
      const col = cols[i];

      col.style.width = parseInt(cell.attrs.colwidth) + "px";
      col.style.minWidth = cellMinWidth + "px";
    });
  }

  updateColgroup(node, cellMinWidth) {
    const cellNodes = node.firstChild.content.content;
    const cellNodeCount = cellNodes.length;
    const cellColWidths = cellNodes.map((cell) => cell.attrs.colwidth);

    const colDOMs = Array.from(this.colgroup.children);
    const colDOMCount = colDOMs.length;

    // updated node had its column/s deleted
    // delete col/s until it matches the updated node's column count
    if (colDOMCount > cellNodeCount) {
      let count = colDOMCount;

      for (let i = colDOMs.length - 1; i >= 0; i--) {
        const col = colDOMs[i];

        col.remove();

        count -= 1;

        if (count === cellNodeCount) {
          break;
        }
      }
    }

    cellColWidths.forEach((colwidth, i) => {
      const col = colDOMs[i];

      // if exist -> mutate the style attributes
      if (col) {
        col.style.width = colwidth + "px";
        col.style.minWidth = cellMinWidth + "px";
      }

      // if it DOES not exist -> create a new col and append
      if (!col) {
        const newCol = document.createElement("col");

        newCol.style.width = colwidth + "px";
        newCol.style.minWidth = cellMinWidth + "px";

        this.colgroup.append(newCol);
      }
    });
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
    tableWrapper.append(this.table);

    const tableResizer = document.createElement("div");
    tableResizer.className = "table-resizer";
    tableResizer.contentEditable = false;
    tableResizer.style.cssText = `
      display: none;
      position: absolute;
      top: 0;
      left: 0;
      background-color: #0051ff82;
      width: 5px;
      height: 100%;
    `;
    tableWrapper.append(tableResizer);
    this.resizer = tableResizer;

    const tableWidth = this.getTableWidth(node);

    // review: establish table's width
    this.table.style.width = tableWidth + "px";
    this.table.style.minWidth = tableWidth + "px";

    // review: establish init colgroup
    this.setInitColgroup(node, this.colgroup, cellMinWidth);

    this.dom = block;
  }

  update(node) {
    // not sure how this can happen, but it can happen
    if (node.type !== this.node.type) return false;

    console.log("UPDATE TABLE NODE VIEW");

    this.node = node;

    // review: need to check if this will work...
    this.updateColgroup(node, this.cellMinWidth);

    return true;
  }

  // fix: just return true for everything
  ignoreMutation(mutation) {
    if (mutation.target === this.resizer) {
      console.log("RESIZE MUTATION"); // fix

      return true;
    }

    console.log("ignoreMutation"); // fix

    return true;
  }
}

export default m_TableView;
