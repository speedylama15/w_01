import { Plugin } from "@tiptap/pm/state";

const CopyAndPaste_Plugin = new Plugin({
  props: {
    // Transform HTML before parsing
    transformPastedHTML(html, view) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // query for td and th
      // colspan and rowspan MUST be 1
      doc.querySelectorAll("td, th").forEach((cell) => {
        cell.setAttribute("colspan", "1");
        cell.setAttribute("rowspan", "1");
      });

      // need to query for list related stuff
      // need to be able to identify Notion's and other editor's checklist

      return html;
    },

    // // Transform parsed content before insertion
    transformPasted(slice, view) {
      slice.content.descendants((node, pos) => {
        console.log(node);
      });

      return slice;
    },

    // // Override entire paste behavior
    // // File handling...
    handlePaste(view, e, slice) {
      return true;
    },
  },
});

export default CopyAndPaste_Plugin;
