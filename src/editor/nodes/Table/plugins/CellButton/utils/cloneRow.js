export const cloneRow = (e, index, tableBlockDOM) => {
  try {
    const tableWrapper = document.createElement("div");
    tableWrapper.style.position = "relative";

    const table = document.querySelector("table").cloneNode(false);
    const colgroup = document.querySelector("colgroup").cloneNode(true);

    const tbody = document.createElement("tbody");
    const rows = Array.from(tableBlockDOM.querySelector("tbody").children);
    const row = rows[index].cloneNode(true);

    const tableSelectionBox = tableBlockDOM
      .querySelector(".table-selection-box")
      .cloneNode(true);
    tableSelectionBox.style.top = 0;
    tableSelectionBox.style.left = 0;

    tableWrapper.append(table, tableSelectionBox);
    table.append(colgroup, tbody);
    tbody.append(row);

    tableWrapper.style.display = "none";
    tableWrapper.style.position = "absolute";
    tableWrapper.style.zIndex = 100;
    tableWrapper.style.opacity = "0.5";

    document.body.appendChild(tableWrapper);

    return tableWrapper;
  } catch (error) {
    console.log(error);
  }
};
