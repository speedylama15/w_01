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

  createTableWrapper() {
    const tableWrapper = document.createElement("div");

    tableWrapper.className = "tableWrapper";

    return tableWrapper;
  }

  createSelectionBox(
    offsetWidth = 0,
    offsetHeight = 0,
    offsetTop = 0,
    offsetLeft = 0
  ) {
    const div = document.createElement("div");
    div.className = "table-selection-box";

    const cellButton = document.createElement("button");
    cellButton.className = "cell-button";

    div.style.cssText = `
      top: ${offsetTop}px;
      left: ${offsetLeft}px;
      width: ${offsetWidth}px;
      height: ${offsetHeight}px;
    `;

    div.append(cellButton);

    return div;
  }

  createColumnButton() {
    const button = document.createElement("button");

    button.className = "table-button table-column-button";
    button.setAttribute("data-table-button-type", "column");
    button.setAttribute("data-table-button-index", null);

    return button;
  }

  createRowButton() {
    const div = document.createElement("div");
    const button = document.createElement("button");

    div.className = "table-row-button-container";

    button.className = "table-button table-row-button";
    button.setAttribute("data-table-button-type", "row");
    button.setAttribute("data-table-button-index", null);

    div.append(button);

    return div;
  }

  constructor(node, cellMinWidth, view, getPos, HTMLAttributes) {
    super(node, cellMinWidth);

    this.view = view;

    const block = this.createBlock(HTMLAttributes);
    const content = this.createContent();
    const tableWrapper = this.createTableWrapper();

    const selectionBox = this.createSelectionBox();
    const columnButton = this.createColumnButton();
    const rowButton = this.createRowButton();

    block.append(content);
    content.append(tableWrapper);

    // assign the ID to the table as well // debug: do I need this tho?
    this.table.setAttribute("data-id", HTMLAttributes["data-id"]);

    tableWrapper.append(rowButton);
    tableWrapper.append(this.table);
    tableWrapper.append(selectionBox, columnButton);

    this.dom = block;
  }

  // return true -> Keep instance and update the existing DOM
  // return false -> Destroy and recreate everything from scratch
  // update(node, decorations, innerDecorations) {
  //   // update method does not have access to the editor...
  //   // maybe I can make use of state? Bring in the state? // idea

  //   // it needs to be able to know if the selection is Cell or Text
  //   // but update() does not have access to the most up to date selection... // fix

  //   return true;
  // }

  // return true = Ignore this DOM change - ProseMirror won't try to reparse it
  // Return false = Handle this DOM change - ProseMirror will reparse and potentially update the document
  // Use true for mutations you caused yourself (like updating <col> widths) to prevent ProseMirror from interfering.
  // ignoreMutation() {
  //   return true;
  // }
}

export default m_TableView;
