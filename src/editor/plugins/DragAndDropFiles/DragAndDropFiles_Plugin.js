import { Plugin, TextSelection } from "@tiptap/pm/state";
import { MultiBlockSelection } from "../../selections/MultiBlockSelection";

import { isInclusive } from "../../../utils";

// fix: this does not work well
// todo: figure out acceptable files, image, audio and video wise
// todo: resort to default File node for files that are not acceptable
// todo: users can drag and hold the file/s they want to insert and drop
// todo: that functionality is similar to holding node/s they want to drag and drop (can create a util function)
// idea: but I'm only going to work on insertion of Image right now...
// todo: many things to handle, like multiple files insertion and file actual uploading

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
  const { schema } = view.state;

  const nodes = await Promise.all(
    validFiles.map(async (item) => {
      const base64Data = await fileToBase64(item.file);

      return schema.nodes[item.type].create({ src: base64Data });
    }),
  );

  const { tr } = view.state;

  const node = nodes[0];

  tr.insert(startPos, node);

  dispatch(tr);
};

const DragAndDropFiles_Plugin = new Plugin({
  props: {
    handleDrop(view, e) {
      e.preventDefault();
      e.stopPropagation();

      const dom = view.dom;
      const { left, right } = dom.getBoundingClientRect();

      const isLeftPadding = isInclusive(e.clientX, left, left + 50);
      const isRightPadding = isInclusive(e.clientX, right - 50, right);

      const queryLeft =
        e.clientX + (isLeftPadding ? 50 : isRightPadding ? -50 : 0);

      const pos = view.posAtCoords({ left: queryLeft, top: e.clientY });

      // fix: notify the user that something went wrong
      if (pos === null) return true;
      if (pos.inside === -1) return true;

      const files = Array.from(e.dataTransfer.files);

      const validFiles = getValidFiles(files);

      uploadFiles(view, validFiles, pos.pos);

      return true;
    },
  },
});

export default DragAndDropFiles_Plugin;
