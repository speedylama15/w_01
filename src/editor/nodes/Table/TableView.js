import { TableView } from "@tiptap/extension-table";
import { CellSelection } from "@tiptap/pm/tables";
import { TextSelection } from "@tiptap/pm/state";
import { getDepth } from "../../utils/getDepth";

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
  // update(node, decorations, innerDecorations) {
  //   const { selection } = this.editor.state;

  //   if (selection instanceof TextSelection) {
  //     const { $from } = selection;

  //     const depth = getDepth($from, "tableCell");
  //     const node = $from.node(depth);

  //     console.log("update TEXT SELECTION", $from); // debug
  //   }

  //   if (selection instanceof CellSelection) {
  //     const { view } = this.editor;
  //     const { $anchorCell, $headCell } = selection;

  //     const anchorDOM = view.nodeDOM($anchorCell.pos);
  //     const headDOM = view.nodeDOM($headCell.pos);

  //     const overlay = this.dom.querySelector(".table-overlay");

  //     const x = Math.min(anchorDOM.offsetLeft, headDOM.offsetLeft);
  //     const y = Math.min(anchorDOM.offsetTop, headDOM.offsetTop);
  //     const r = Math.max(
  //       anchorDOM.offsetLeft + anchorDOM.offsetWidth,
  //       headDOM.offsetLeft + headDOM.offsetWidth
  //     );
  //     const b = Math.max(
  //       anchorDOM.offsetTop + anchorDOM.offsetHeight,
  //       headDOM.offsetTop + headDOM.offsetHeight
  //     );
  //     const width = r - x;
  //     const height = b - y;

  //     overlay.style.display = "flex";
  //     overlay.style.top = y + 4 + "px";
  //     overlay.style.left = x + 4 + "px";
  //     overlay.style.width = width + "px";
  //     overlay.style.height = height + "px";

  //     console.log("update CELL SELECTION", r, b); // debug
  //   }

  //   return true;
  // }

  // return true = Ignore this DOM change - ProseMirror won't try to reparse it
  // Return false = Handle this DOM change - ProseMirror will reparse and potentially update the document
  // Use true for mutations you caused yourself (like updating <col> widths) to prevent ProseMirror from interfering.
  ignoreMutation() {
    return true;
  }
}

export default m_TableView;
