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

    tableWrapper.append(this.table);

    return tableWrapper;
  }

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
      z-index: 100;
      background-color: transparent;
      border: 2px solid #00d52eff;
      border-radius: 2px;
      width: ${offsetWidth}px;
      height: ${offsetHeight}px;
    `;

    const h_button = document.createElement("button");
    const v_button = document.createElement("button");

    div.append(h_button);
    div.append(v_button);

    h_button.style.cssText = `
      position: absolute;
      top: 0px;
      left: 50%;
      transform: translate(-50%, calc(-50% - 1px));
      width: 20px;
      height: 7px;
      border: 1px solid #18b100ff;
      background-color: #fff;
      border-radius: 3px;
    `;

    v_button.style.cssText = `
      position: absolute;
      top: 50%;
      left: 0;
      transform: translate(calc(-50% - 1px), -50%) rotate(90deg);
      width: 20px;
      height: 7px;
      border: 1px solid #18b100ff;
      background-color: #fff;
      border-radius: 3px;
    `;

    return div;
  }

  constructor(node, cellMinWidth, HTMLAttributes) {
    super(node, cellMinWidth);

    const block = this.createBlock(HTMLAttributes);
    const content = this.createContent();
    const tableWrapper = this.createTableWrapper();
    const tableOverlay = this.createOverlay();

    block.append(content);
    content.append(tableWrapper);
    // tableWrapper.append(tableOverlay);
    this.table.append(tableOverlay);

    // debug: tbody
    console.log("contentDOM", this.contentDOM);

    this.dom = block;
  }
}

export default m_TableView;
