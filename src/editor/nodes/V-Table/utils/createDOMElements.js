export const createBlockDOM = (HTMLAttributes) => {
  const block = document.createElement("div");
  block.classList.add("block", "block-vTable");

  Object.entries(HTMLAttributes).forEach((attribute) => {
    block.setAttribute(attribute[0], attribute[1]);
  });

  return block;
};

export const createContentDOM = () => {
  const content = document.createElement("div");
  content.classList.add("content", "content-vTable");

  return content;
};

export const createTableWrapperDOM = () => {
  const tableWrapper = document.createElement("div");
  tableWrapper.classList.add("table-wrapper");

  return tableWrapper;
};

export const createTableDOM = (node) => {
  const table = document.createElement("table");
  const colgroup = document.createElement("colgroup");
  const tbody = document.createElement("tbody");

  let tableWidth = 0;

  for (let i = 0; i < node.firstChild.children.length; i++) {
    const child = node.firstChild.children[i];
    const colwidth = child.attrs.colwidth;
    tableWidth += colwidth;

    const col = document.createElement("col");
    col.style.minWidth = "150px";
    col.style.width = colwidth + "px";
    colgroup.append(col);
  }

  table.style.minWidth = tableWidth + "px";

  table.append(colgroup);
  table.append(tbody);

  return { table, tbody };
};

export const createColumnResizerDOM = () => {
  const columnResizer = document.createElement("div");
  columnResizer.contentEditable = false;
  columnResizer.className = "column-resizer";

  return columnResizer;
};
