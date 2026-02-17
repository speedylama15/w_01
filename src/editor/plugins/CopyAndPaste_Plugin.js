import { Plugin } from "@tiptap/pm/state";

export const createCopyAndPastePlugin = () => {
  return new Plugin({
    props: {
      // 4
      handlePaste(view, e, slice) {
        console.log("handlePaste");
        return false; // false = allow default paste
      },

      // 3
      transformPasted(slice, view) {
        console.log("transformPasted", slice);
        return slice; // return the slice
      },

      // 2
      transformPastedHTML(html, view) {
        console.log("transformPastedHTML");
        return html; // return the HTML string
      },

      handleDOMEvents: {
        // 1
        paste(view, e) {
          console.log("paste");
          return false; // false = allow event to continue
        },
      },
    },
  });
};
