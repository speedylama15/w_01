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

  // todo: better design
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

  constructor(node, cellMinWidth, HTMLAttributes, editor) {
    super(node, cellMinWidth);

    this.editor = editor;

    const block = this.createBlock(HTMLAttributes);
    const content = this.createContent();
    const tableWrapper = this.createTableWrapper();
    const tableOverlay = this.createOverlay();

    block.append(content);
    content.append(tableWrapper);

    // assign the ID to the table as well // debug: do I need this tho?
    this.table.setAttribute("data-id", HTMLAttributes["data-id"]);

    tableWrapper.append(this.table);
    tableWrapper.append(tableOverlay);

    this.dom = block;
  }

  // return true -> Keep instance and update the existing DOM
  // return false -> Destroy and recreate everything from scratch
  // update(node, decorations, innerDecorations) {
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
