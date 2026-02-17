import { Plugin, TextSelection } from "@tiptap/pm/state";
import { getDepthByNodeType } from "../utils/depth/getDepthByNodeType";

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
  "audio/mp4 (M4A)",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
];

const videoTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];

export const createDragFileAndDropPlugin = () => {
  return new Plugin({
    props: {
      async handleDrop(view, e) {
        e.preventDefault();

        // will need to add or subtract 50
        const pos = view.posAtCoords({ left: e.clientX + 50, top: e.clientY });

        if (pos === null) return true;

        if (pos.inside === -1) {
          // add it at the end of the doc
          return true;
        }

        const { tr } = view.state;
        const { dispatch } = view;

        tr.setSelection(TextSelection.create(tr.doc, pos.pos));

        const result = getDepthByNodeType(tr.selection.$from, "block");
        if (!result) return true;

        const after = tr.selection.$from.after(result.depth);

        const files = Array.from(e.dataTransfer.files);

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

        // will need add conditions
        const results = await Promise.all(
          validFiles.map((data) => {
            const { type, file } = data;

            return new Promise((resolve, reject) => {
              const reader = new FileReader();

              reader.onload = (e) => resolve({ type, data: e.target.result });

              reader.onerror = reject;

              reader.readAsDataURL(file);
            });
            //
          }),
        );

        results.forEach((result) => {
          const { type, data } = result;

          const node = view.state.schema.nodes[type].create({ src: data });

          tr.insert(tr.mapping.map(after), node);
        });

        dispatch(tr);

        return true;
      },
    },
  });
};
