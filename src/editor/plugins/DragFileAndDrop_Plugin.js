import { Plugin } from "@tiptap/pm/state";

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
        dragstart(view, e) {
          e.preventDefault();
          return true;
        },

        dragover(view, e) {
          e.preventDefault();
          return true;
        },

        drag(view, e) {
          e.preventDefault();
          return true;
        },
      },
    },
  });
};
