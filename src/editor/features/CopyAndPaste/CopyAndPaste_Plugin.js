import { Fragment, Slice } from "@tiptap/pm/model";
import { Plugin } from "@tiptap/pm/state";

const createFillerCell = (schema, type) => {
  const item = schema.nodes.paragraphItem.create({});

  const cell = schema.nodes[type].create({}, item);

  return cell;
};

const getIsHeaderColumn = (rows) => {
  let isHeaderColumn = false;

  if (rows.length === 1) {
    return isHeaderColumn;
  }

  const firstRow = rows[0];
  const secondRow = rows[1];
  const firstRowFirstCell = firstRow.firstChild;
  const secondRowFirstCell = secondRow.firstChild;

  if (
    firstRowFirstCell.type.name === "tableHeader" &&
    secondRowFirstCell.type.name === "tableHeader"
  ) {
    isHeaderColumn = true;

    return isHeaderColumn;
  }

  return isHeaderColumn;
};

const getIsHeaderRow = (rows) => {
  let isHeaderRow = false;

  const firstRow = rows[0];
  const firstRowFirstCell = firstRow.firstChild;

  if (firstRowFirstCell.type.name === "tableHeader") {
    isHeaderRow = true;

    return isHeaderRow;
  }

  return isHeaderRow;
};

const CopyAndPaste_Plugin = new Plugin({
  props: {
    // Transform HTML before parsing
    transformPastedHTML(html, view) {
      // capable of fixing invalid html like standalone tr/td/th
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // remove any rows in which are empty
      doc.querySelectorAll("tr").forEach((tr) => {
        if (tr.children.length === 0) {
          tr.remove();
        }
      });

      // query for td and th
      // colspan and rowspan MUST be 1
      doc.querySelectorAll("td, th").forEach((cell) => {
        cell.setAttribute("colspan", "1");
        cell.setAttribute("rowspan", "1");
      });

      doc.querySelectorAll("[data-pm-slice]").forEach((el) => {
        el.removeAttribute("data-pm-slice");
      });

      // need to query for list related stuff
      // need to be able to identify Notion's and other editor's checklist

      return doc.body.innerHTML;
    },

    // // Transform parsed content before insertion
    transformPasted(slice, view) {
      const blocks = [];
      let temp = [];

      slice.content.descendants((node) => {
        if (node.attrs.nodeType === "block") {
          // push temp and reset when block encounter
          if (temp.length > 0) {
            const table = view.state.schema.nodes.table.create(
              {},
              Fragment.from(temp),
            );

            blocks.push(table);

            temp = [];
          }

          blocks.push(node);

          return false;
        }

        // tableRow, tableHeader, tableCell
        // but ONLY accept tableRow
        if (
          node.attrs.nodeType === "content" &&
          node.type.name === "tableRow"
        ) {
          temp.push(node);

          return false;
        }
      });

      if (temp.length > 0) {
        const table = view.state.schema.nodes.table.create(
          {},
          Fragment.from(temp),
        );

        blocks.push(table);

        temp = [];
      }

      // normalize all the tables
      const newBlocks = [];

      blocks.forEach((block) => {
        const { schema } = view.state;
        const { tableRow } = schema.nodes;

        if (block.type.name === "table") {
          const table = block;
          const rows = table.children; // just an array of Nodes

          // review: skip table if it has 0 rows for some reason...
          if (rows.length === 0) return;

          // find the longest row
          let length = 0;
          rows.forEach((row) => {
            if (row.children.length >= length) {
              length = row.children.length;
            }
          });

          // retrieve the widths from the first row
          // fill the array if necessary
          const firstRow = rows[0];
          const colwidths = [];
          for (let i = 0; i < length; i++) {
            const cell = firstRow.children[i];
            const colwidth = cell?.attrs?.colwidth;

            if (colwidth) {
              colwidths.push(colwidth);
            } else {
              colwidths.push(150);
            }
          }

          const isHeaderRow = getIsHeaderRow(rows);
          const isHeaderColumn = getIsHeaderColumn(rows);

          const newRows = [];
          rows.forEach((row, i) => {
            const cells = row.children;

            // skip if row for some reason has no cells
            if (cells.length === 0) return;

            const content = [];

            colwidths.forEach((colwidth, j) => {
              const cell = cells[j];

              // need type
              let type = "tableCell";

              // isHeaderRow and the first row
              if (isHeaderRow && i === 0) {
                type = "tableHeader";
              }

              // isHeaderColumn, not first row, is first cell
              if (isHeaderColumn && i !== 0 && j === 0) {
                type = "tableHeader";
              }

              console.log(type);

              // revise existing cell or create a filler cell
              const newCell = cell
                ? schema.nodes[type].create(
                    {
                      colspan: 1,
                      rowspan: 1,
                      colwidth,
                      nodeType: "content",
                      contentType: type,
                    },
                    cell.content,
                    cell.marks,
                  )
                : createFillerCell(schema, type);

              content.push(newCell);
            });

            const newRow = tableRow.create({}, Fragment.from(content));

            newRows.push(newRow);
          });

          const newTable = schema.nodes.table.create(
            {},
            Fragment.from(newRows),
          );

          newBlocks.push(newTable);

          return;
        }

        newBlocks.push(block);
      });

      return new Slice(Fragment.from(newBlocks), 0, 0);
    },

    // // Override entire paste behavior
    // // File handling...
    // handlePaste(view, e, slice) {
    //   return true;
    //   // return false;
    // },
  },
});

export default CopyAndPaste_Plugin;

<table>
  <tbody>
    <tr>
      <td colspan="1" rowspan="1" colwidth="185,154">
        <p data-id="dcfdb462-a1d1-4bca-b15f-ccc0c841e296">Product Manager</p>
        <p data-id="c592e682-9f1f-46f5-98fb-9b2993c5dfa4">Product</p>
        <p data-id="a11f34c5-35b6-4d47-acce-0121e810bf65">UX Designer</p>
        <p data-id="c2a2961c-1dbc-4347-ba07-ec082d90b641">Design</p>
        <p data-id="90dfe1be-dc5b-464e-b897-8687f7199e4e">Data Analyst</p>
        <p data-id="3320699c-85cb-4108-abe7-fe5a4a04308a">Analytics</p>
      </td>
    </tr>
  </tbody>
</table>;
