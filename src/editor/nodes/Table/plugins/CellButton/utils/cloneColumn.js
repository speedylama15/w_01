export const cloneColumn = (e, index, tableBlockDOM) => {
  try {
    const tableWrapper = document.createElement("div");
    tableWrapper.style.position = "relative";

    const table = document.createElement("table");

    const colgroup = document.createElement("colgroup");
    const col = tableBlockDOM
      ?.querySelector("colgroup")
      ?.children[index]?.cloneNode(true);
    colgroup.append(col);

    const tbody = document.createElement("tbody");
    const rows = Array.from(tableBlockDOM.querySelector("tbody").children);
    rows.forEach((tr) => {
      const cell = tr.children[index];

      if (cell) {
        const clonedTr = tr.cloneNode(false);
        clonedTr.append(cell.cloneNode(true));
        tbody.append(clonedTr);
      }
    });

    const tableSelectionBox = tableBlockDOM
      .querySelector(".table-selection-box")
      .cloneNode(true);
    tableSelectionBox.style.top = 0;
    tableSelectionBox.style.left = 0;

    tableWrapper.append(table, tableSelectionBox);
    table.append(colgroup, tbody);

    tableWrapper.style.display = "none";
    tableWrapper.style.width = parseInt(col.style.width) + 1 + "px";
    tableWrapper.style.position = "absolute";
    tableWrapper.style.zIndex = 100;
    tableWrapper.style.opacity = "0.5";

    document.body.appendChild(tableWrapper);

    return tableWrapper;
  } catch (error) {
    console.log(error);
  }
};
