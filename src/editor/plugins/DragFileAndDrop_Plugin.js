import { Plugin, TextSelection } from "@tiptap/pm/state";

// idea: this place will handle custom drag and drop as well...

const imageTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

const audioTypes = [
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
];

const videoTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];

const getValidFiles = (files) => {
  const validFiles = [];

  files.forEach((file) => {
    if (imageTypes.includes(file.type)) {
      validFiles.push({ type: "image", file });
    }

    if (audioTypes.includes(file.type)) {
      validFiles.push({ type: "audio", file });
    }

    if (videoTypes.includes(file.type)) {
      validFiles.push({ type: "video", file });
    }
  });

  return validFiles;
};

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => resolve(e.target.result);

    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}

const uploadFiles = async (view, validFiles, startPos) => {
  const { dispatch } = view;
  const { tr, schema } = view.state;

  const nodes = await Promise.all(
    validFiles.map(async (item) => {
      const base64Data = await fileToBase64(item.file);

      return schema.nodes[item.type].create({ src: base64Data });
    }),
  );

  let offset = 0;

  for (const node of nodes) {
    tr.insert(startPos + offset, node);

    offset += node.nodeSize;
  }

  dispatch(tr);
};

export const createDragFileAndDropPlugin = () => {
  return new Plugin({
    props: {
      // createSelectionBetween(view, anchor, head) {},

      handleDrop(view, e) {
        e.preventDefault();

        // fix: either add or subtract 50
        const pos = view.posAtCoords({ left: e.clientX + 50, top: e.clientY });
        if (pos === null) return true;
        if (pos.inside === -1) return true;

        const files = Array.from(e.dataTransfer.files);

        const validFiles = getValidFiles(files);

        uploadFiles(view, validFiles, pos.pos);

        return true;
      },

      handleDOMEvents: {
        // mousemove(view, e) {
        //   e.preventDefault();
        //   return true;
        // },

        selectionchange(view, e) {
          console.log(e);
        },

        // dragstart(view, e) {
        //   e.preventDefault();
        //   return true;
        // },

        // dragover(view, e) {
        //   e.preventDefault();
        //   return true;
        // },

        // drag(view, e) {
        //   e.preventDefault();
        //   return true;
        // },
      },
    },

    view() {
      let isDown = false;

      let anchorDOM = null;
      let anchorOffset = null;

      const handleMouseDown = () => {
        isDown = true;
      };

      const handleMove = (e) => {
        if (!isDown) return;

        const tableDOM = e.target.closest(".block-table");

        if (!tableDOM) return;

        // e.preventDefault();

        // const sel = window.getSelection();

        // if (sel?.rangeCount && anchorDOM === null) {
        //   anchorDOM = sel.anchorNode;
        //   anchorOffset = sel.anchorOffset;
        // }

        // if (!anchorDOM) return;

        // const range = document.createRange();

        // range.setStartAfter(tableDOM);
        // range.setEnd(anchorDOM, anchorOffset);

        // sel.removeAllRanges();
        // sel.addRange(range);
      };

      const handleMouseUp = () => {
        isDown = false;
      };

      const handleSelectionChange = () => {
        console.log("selectionchange fired");

        const sel = window.getSelection();
        if (!sel?.rangeCount) return;

        const range = sel.getRangeAt(0);
        const tableDOM = document.querySelector(".block-table");

        if (!tableDOM) return;

        const focusInTable =
          tableDOM.contains(range.endContainer) ||
          tableDOM.contains(range.startContainer);

        if (focusInTable) {
          const anchorDOM = sel.anchorNode;
          const anchorOffset = sel.anchorOffset;

          // Correct the selection synchronously before ProseMirror reads it
          const newRange = document.createRange();
          newRange.setStart(anchorDOM, anchorOffset);
          newRange.setEndBefore(tableDOM);

          sel.removeAllRanges();
          // sel.addRange(newRange);
        }
      };

      document.addEventListener("mousedown", handleMouseDown);
      document.addEventListener("mousemove", handleMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("selectionchange", handleSelectionChange);

      return {
        destroy() {
          document.removeEventListener("mousedown", handleMouseDown);
          document.removeEventListener("mousemove", handleMove);
          document.removeEventListener("mouseup", handleMouseUp);
          document.removeEventListener(
            "selectionchange",
            handleSelectionChange,
          );
        },
      };
    },
  });
};
