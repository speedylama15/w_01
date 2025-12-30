import { TableView } from "@tiptap/extension-table";
import { CellSelectingKey } from "./CellSelecting";

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

  createColgroup(node) {
    let tableWidth = 0;

    this.colgroup.innerHTML = "";
    this.colgroup.id = "colgroup";

    node.content.content[0].content.content.forEach((content) => {
      const col = document.createElement("col");

      col.style.cssText = `
        width: ${content.attrs.colwidth}px;
        min-width: 150px;
      `;

      this.colgroup.append(col);

      tableWidth += parseInt(content.attrs.colwidth);
    });

    return tableWidth;
  }

  // fix: better design
  createOverlay(
    offsetWidth = 0,
    offsetHeight = 0,
    offsetTop = 0,
    offsetLeft = 0
  ) {
    const div = document.createElement("div");
    div.className = "table-overlay";

    div.style.cssText = `
      display: none;
      position: absolute; 
      top: ${offsetTop}px;
      left: ${offsetLeft}px;
      z-index: 3;
      background-color: transparent;
      border: 2px solid #00d52eff;
      border-radius: 2px;
      width: ${offsetWidth}px;
      height: ${offsetHeight}px;
      transform: translate(0.5px, 0.5px);
      pointer-events: none;
    `;

    const tableXButton = document.createElement("button");
    const tableYButton = document.createElement("button");

    div.append(tableXButton);
    div.append(tableYButton);

    tableXButton.className = "table-x-button";
    tableXButton.style.cssText = `
      position: absolute;
      top: 0px;
      left: 50%;
      transform: translate(-50%, calc(-50% - 1px));
      width: 20px;
      height: 7px;
      border: 1px solid #18b100ff;
      background-color: #fff;
      border-radius: 3px;
      pointer-events: auto;
    `;

    tableYButton.className = "table-y-button";
    tableYButton.style.cssText = `
      position: absolute;
      top: 50%;
      left: 0;
      transform: translate(calc(-50% - 1px), -50%) rotate(90deg);
      width: 20px;
      height: 7px;
      border: 1px solid #18b100ff;
      background-color: #fff;
      border-radius: 3px;
      pointer-events: auto;
    `;

    return div;
  }

  // fix: delete?
  createColResizer() {
    const div = document.createElement("div");

    div.className = "col-resizer";

    return div;
  }

  constructor(node, cellMinWidth, HTMLAttributes, editor) {
    super(node, cellMinWidth);

    this.editor = editor;

    const block = this.createBlock(HTMLAttributes);
    const content = this.createContent();
    const tableWrapper = this.createTableWrapper();
    const tableOverlay = this.createOverlay();
    const tableWidth = this.createColgroup(node);

    block.append(content);
    content.append(tableWrapper);

    this.table.setAttribute("data-id", HTMLAttributes["data-id"]);
    this.table.style.width = `${tableWidth}px`;
    this.table.style.minWidth = `${tableWidth}px`;

    tableWrapper.append(this.table);
    tableWrapper.append(tableOverlay);

    this.dom = block;
  }

  // return true -> Keep instance and update the existing DOM
  // return false -> Destroy and recreate everything from scratch
  update(node, decorations, innerDecorations) {
    const selectionBoxState = CellSelectingKey.getState(this.editor.state);

    console.log("update", selectionBoxState);

    // const isSelected = innerDecorations.find().length > 0;

    // if (isSelected) {
    //   const cellID =
    //     innerDecorations.find()[0].type.attrs["data-display-selection-box"];
    //   const cellDOM = this.table.querySelector(`[data-id="${cellID}"]`);

    //   if (!cellID) return true;

    //   const blockDOM = this.dom;
    //   const overlayDOM = blockDOM.querySelector(".table-overlay");

    //   const { offsetWidth, offsetHeight, offsetLeft, offsetTop } = cellDOM;

    //   overlayDOM.style.display = "flex";
    //   overlayDOM.style.width = offsetWidth + "px";
    //   overlayDOM.style.height = offsetHeight + "px";
    //   overlayDOM.style.left = offsetLeft + 4 + "px";
    //   overlayDOM.style.top = offsetTop + 4 + "px";

    //   return true;
    // } else {
    //   const blockDOM = this.dom;
    //   const overlayDOM = blockDOM.querySelector(".table-overlay");

    //   overlayDOM.style.display = "none";

    //   return true;
    // }
  }

  // return true = Ignore this DOM change - ProseMirror won't try to reparse it
  // Return false = Handle this DOM change - ProseMirror will reparse and potentially update the document
  // Use true for mutations you caused yourself (like updating <col> widths) to prevent ProseMirror from interfering.
  ignoreMutation() {
    return true;
  }
}

export default m_TableView;
