import { create } from "zustand";

const dragAndDropStore = create((set) => {
  return {
    operation: null, // fix
    editorTree: null,
    editorBlocks: null,
    selectedChunkMap: null,

    setOperation: (operation) => set({ operation }), // fix
    setEditorTree: (tree) => set({ editorTree: tree }),
    setEditorBlocks: (blocks) => set({ editorBlocks: blocks }),
    setSelectedChunkMap: (map) => set({ selectedChunkMap: map }),
  };
});

export default dragAndDropStore;
