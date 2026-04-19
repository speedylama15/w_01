import { createStore } from "zustand/vanilla";

const TableNode_Store = createStore((set) => ({
  // fix: this needs to go elsewhere
  mouseState: null,
  operation: null,
  setMouseState: (state) => set({ mouseState: state }),
  setOperation: (operation) => set({ operation }),
  // fix: this needs to go elsewhere

  tableID: null,
  tableDOM: null,
  tableContainerDOM: null,
  tableContainerRect: null,
  tableNode: null,
  tableMap: null,
  columnDimensions: null,
  rowDimensions: null,
  anchorPos: null,
  headPos: null,

  setTableID: (tableID) => set({ tableID }),
  setTableDOM: (tableDOM) => set({ tableDOM }),
  setTableContainerDOM: (tableContainerDOM) => set({ tableContainerDOM }),
  setTableContainerRect: (tableContainerRect) => set({ tableContainerRect }),
  setTableNode: (tableNode) => set({ tableNode }),
  setTableMap: (tableMap) => set({ tableMap }),
  setColumnDimensions: (columnDimensions) => set({ columnDimensions }),
  setRowDimensions: (rowDimensions) => set({ rowDimensions }),
  setAnchorPos: (pos) => set({ anchorPos: pos }),
  setHeadPos: (pos) => set({ headPos: pos }),

  resetTableState: () =>
    set({
      tableID: null,
      tableDOM: null,
      tableContainerDOM: null,
      tableContainerRect: null,
      tableNode: null,
      tableMap: null,
      columnDimensions: null,
      rowDimensions: null,
      anchorPos: null,
      headPos: null,
    }),
}));

export default TableNode_Store;
