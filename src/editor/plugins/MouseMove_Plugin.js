import { Plugin, PluginKey } from "@tiptap/pm/state";

export const MouseMove_Plugin = new Plugin({
  view(view) {
    let mouseOperation = null;
    let startCoords = { x: 0, y: 0 };
    let resizerDirection = null;
    let pos = null;
    let node = null;

    // fix: make sure that the mousedown is from left click
    const handleMouseDown = (e) => {
      const imageResizer = e.target.closest(".image-resizer");

      if (!imageResizer) return;

      e.preventDefault(); // to prevent selections from being made
      pos = view.posAtDOM(imageResizer.closest(".block-image"));
      node = view.state.doc.nodeAt(pos);
      mouseOperation = "image-resize";
      startCoords = { x: e.clientX, y: e.clientY };
      resizerDirection = imageResizer.getAttribute("data-direction");
    };

    const handleMouseMove = (e) => {
      const { tr } = view.state;
      const { dispatch } = view;

      if (mouseOperation !== "image-resize") return;

      const deltaX =
        (e.clientX - startCoords.x) * (resizerDirection === "right" ? -1 : 1);

      const newWidth = Math.min(
        // review:
        800,
        Math.max(200, parseInt(node.attrs.width) - deltaX),
      );

      tr.setNodeAttribute(pos, "width", newWidth);

      dispatch(tr);
    };

    const handleMouseUp = () => {
      if (mouseOperation !== "image-resize") return;

      mouseOperation = null;
      startCoords = { x: 0, y: 0 };
    };

    view.root.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return {
      destroy() {
        view.root.removeEventListener("mousedown", handleMouseDown);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      },
    };
  },
});
