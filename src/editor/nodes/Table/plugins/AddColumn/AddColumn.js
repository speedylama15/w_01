import { Plugin, PluginKey } from "@tiptap/pm/state";

export const AddColumnKey = new PluginKey("AddColumnKey");

export const AddColumn = new Plugin({
  key: AddColumnKey,

  //   view(view) {
  //     let tableWrapperRect = null;

  //     const handleMouseMove = (e) => {
  //       const { tr } = view.state;
  //       const { dispatch } = view;

  //       const table = e.target.closest("table");

  //       if (table) {
  //         const tableWrapper = table?.parentElement;
  //         const rect = tableWrapperRect
  //           ? tableWrapperRect
  //           : tableWrapper.getBoundingClientRect();

  //         tableWrapperRect = rect;

  //         tr.setMeta("open-add-column", {
  //           tableWrapperRect: rect,
  //           tableWrapper,
  //         });

  //         dispatch(tr);

  //         return;
  //       }
  //     };

  //     document.addEventListener("mousemove", handleMouseMove);

  //     return {
  //       destroy() {
  //         document.removeEventListener("mousemove", handleMouseMove);
  //       },
  //     };
  //   },
});
