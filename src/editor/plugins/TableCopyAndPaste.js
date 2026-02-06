import { Plugin } from "@tiptap/pm/state";
import { CellSelection } from "@tiptap/pm/tables";
import { Fragment } from "@tiptap/pm/model";

const getTableMap = (tableNode, tableBefore) => {
  const rowArray = [];
  const cellGrid = [];

  let rowIndex = null;

  tableNode.descendants((node, pos, parent, index) => {
    const nodePos = tableBefore + pos + 1;

    if (node.type.name === "tableRow") {
      const row = {
        node,
        pos: nodePos,
      };

      rowArray.push(row);

      rowIndex = index;
    }

    if (node.type.name === "tableHeader" || node.type.name === "tableCell") {
      const cell = {
        type: node.type.name === "tableHeader" ? "header" : "cell",
        node,
        pos: nodePos,
      };

      const row = cellGrid[rowIndex];

      if (!row) {
        cellGrid.push([cell]);
      } else {
        row.push(cell);
      }

      return false;
    }
  });

  return { rowArray, cellGrid };
};

export const TableCopyAndPaste = new Plugin({
  props: {
    handlePaste(view, e, slice) {
      if (!slice) return true;

      let p_col = 0;
      let p_row = 0;
      const r_rows = [];

      // return false to stop
      slice.content.descendants((node) => {
        if (node.type.name === "tableRow") {
          const columnCount = node.content.content.length;

          if (columnCount > p_col) p_col = columnCount;

          p_row += 1;
          r_rows.push(node);

          return false;
        }
      });

      const { selection, tr } = view.state;
      const { dispatch } = view;

      if (selection instanceof CellSelection) {
        let topLeftCellNode = null;

        selection.forEachCell((node, pos) => {
          if (topLeftCellNode === null) topLeftCellNode = { node, pos };
        });

        const dom = view.nodeDOM(topLeftCellNode.pos);
        const cellIndex = dom.cellIndex;
        const rowIndex = dom.parentElement.rowIndex;

        const tableNode = selection.$anchorCell.node(-1);
        const tableBefore = selection.$anchorCell.before(-1);
        const tableMap = getTableMap(tableNode, tableBefore);

        const t_col = tableMap.cellGrid[0].length;
        const t_row = tableMap.cellGrid.length;

        const col_to_add = cellIndex + p_col - t_col;
        const row_to_add = rowIndex + p_row - t_row;

        const tableCell = view.state.schema.nodes.tableCell.create(
          { colspan: 1, rowspan: 1, colwidth: 150 },
          view.state.schema.nodes.paragraphItem.create({}),
        );

        const tableHeader = view.state.schema.nodes.tableHeader.create(
          { colspan: 1, rowspan: 1, colwidth: 150 },
          view.state.schema.nodes.paragraphItem.create({}),
        );

        if (col_to_add > 0) {
          const { cellGrid } = tableMap;

          cellGrid.forEach((row) => {
            const { type, pos, node } = row[row.length - 1];

            const fragment = Fragment.from(
              Array(col_to_add).fill(type === "cell" ? tableCell : tableHeader),
            );

            tr.insert(tr.mapping.map(pos + node.nodeSize), fragment);
          });
        }

        if (row_to_add > 0) {
          const r = col_to_add > 0 ? t_col + col_to_add : t_col;

          const fragment = Fragment.from(Array(r).fill(tableCell));

          console.log({ col_to_add, t_col });

          const tableRow = view.state.schema.nodes.tableRow.create(
            {},
            fragment,
          );

          const { rowArray } = tableMap;
          const { node, pos } = rowArray[rowArray.length - 1];

          tr.insert(
            tr.mapping.map(pos + node.nodeSize),
            Fragment.from(Array(row_to_add).fill(tableRow)),
          );
        }

        const updatedTableNode = tr.doc.nodeAt(tableBefore);
        const updatedTableMap = getTableMap(updatedTableNode, tableBefore);

        const updatedCellGrid = updatedTableMap.cellGrid;
        let currCellIndex = cellIndex;
        let currRowIndex = rowIndex;

        let mapFrom = tr.mapping.maps.length;

        r_rows.forEach((rowNode) => {
          rowNode.content.content.forEach((cellNode) => {
            const cell = updatedCellGrid[currRowIndex][currCellIndex];

            const from = tr.mapping.slice(mapFrom).map(cell.pos);
            const to = tr.mapping
              .slice(mapFrom)
              .map(cell.pos + cell.node.nodeSize);

            tr.replaceWith(from, to, cellNode);

            currCellIndex++;
          });

          currRowIndex++;
          currCellIndex = cellIndex;
        });

        dispatch(tr);
      }

      // handle when selection is an instance of TextSelection

      return true;
    },

    transformPasted(slice) {
      return slice;
    },

    transformPastedHTML(html) {
      const parser = new window.DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const cells = doc.querySelectorAll("td, th");

      cells.forEach((cell) => {
        let targetCell = cell;

        if (cell.tagName.toLowerCase() === "th") {
          targetCell = doc.createElement("td");

          while (cell.firstChild) {
            targetCell.appendChild(cell.firstChild);
          }

          cell.parentNode.replaceChild(targetCell, cell);
        }

        const attributes = targetCell.getAttributeNames();
        attributes.forEach((attr) => targetCell.removeAttribute(attr));

        targetCell.setAttribute("colspan", "1");
        targetCell.setAttribute("rowspan", "1");
      });

      return doc.body.innerHTML;
    },
  },
});
