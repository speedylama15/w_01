import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import { CellSelection } from "prosemirror-tables";
import { DecorationSet, Decoration } from "@tiptap/pm/view";

import mainStore from "../../../../stores/mainStore";
import cellSelectingStore from "../stores/cellSelectingStore";

import { getDepthByNodeType } from "../../../utils/depth/getDepthByNodeType";
import { getDepthByContentType } from "../../../utils/depth/getDepthByContentType";

// todo: left click, disallow scrolling, only 1 operation
// todo: add an raf that allows scrolling to occur in the table
// idea: still thinking if I should use plugin's state for anchor/head pos

const IDLE = "IDLE";
const DOWN = "DOWN";
const DRAG = "DRAG";
// idea: difference between move and drag
const CELL_SELECTING = "CELL_SELECTING";
const HIDE_NATIVE_SELECTION = "HIDE_NATIVE_SELECTION";

const setTableControls = (container, anchorCell, headCell) => {
  const box = container.querySelector(".selection-box");

  const containerRect = container.getBoundingClientRect();
  const anchorRect = anchorCell.getBoundingClientRect();
  const headRect = headCell.getBoundingClientRect();

  const top = Math.min(anchorRect.top, headRect.top);
  const bottom = Math.max(anchorRect.bottom, headRect.bottom);
  const left = Math.min(anchorRect.left, headRect.left);
  const right = Math.max(anchorRect.right, headRect.right);

  box.style.top = top - containerRect.top + "px";
  box.style.left = left - containerRect.left + container.scrollLeft + "px";
  box.style.width = right - left + "px";
  box.style.height = bottom - top + "px";

  const columnButton = container.querySelector(".column-button");
  const cellIndex = headCell.cellIndex;
  columnButton.setAttribute("data-index", cellIndex);
  columnButton.style.top = 0 + "px";
  columnButton.style.left =
    headRect.left -
    containerRect.left +
    container.scrollLeft +
    headRect.width / 2 +
    "px";

  const contentWrapper = container.parentNode;
  const rowButton = contentWrapper.querySelector(".row-button");
  const rowIndex = headCell.parentNode.rowIndex;
  rowButton.setAttribute("data-index", rowIndex);
  rowButton.style.top =
    headRect.top - containerRect.top + headRect.height / 2 + "px";
  rowButton.style.left = 0 + "px";
};

const isInclusive = (pos, from, to) => {
  return pos >= from && pos <= to;
};

const mousedownOnCell = (e, view, tr, dispatch, start, end) => {
  const clickedPos = view.posAtCoords({ left: e.clientX, top: e.clientY });

  if (!clickedPos || !isInclusive(clickedPos.pos, start, end)) {
    const textSelection = TextSelection.create(tr.doc, start);

    tr.setSelection(textSelection);

    dispatch(tr);
  } else {
    const textSelection = TextSelection.create(tr.doc, clickedPos.pos);

    tr.setSelection(textSelection);

    dispatch(tr);
  }
};

const getCellDataFromDOM = (view, cellDOM) => {
  const before = view.posAtDOM(cellDOM) - 1;
  const node = view.state.doc.nodeAt(before);
  const after = before + node.nodeSize;
  const start = before + 2; // add and subtract by 2
  const end = after - 2;

  return { before, start, end, after, node };
};

const CellSelecting_Key = new PluginKey("CellSelecting_Key");

const CellSelecting_Plugin = new Plugin({
  key: CellSelecting_Key,

  state: {
    init() {
      return {
        isCellSelecting: false,
        tableID: null,
        anchorPos: null,
      };
    },

    apply(tr, value) {
      const cellSelecting = tr.getMeta(CELL_SELECTING);

      if (cellSelecting) return cellSelecting;

      return value;
    },
  },

  props: {
    attributes(state) {
      const { selection } = state;

      if (selection instanceof CellSelection) {
        return { class: "hide-native-selection" };
      }

      return null;
    },

    createSelectionBetween(view) {
      const cellSelecting = CellSelecting_Key.getState(view.state);

      if (cellSelecting?.isCellSelecting) return view.state.selection; // disable this and performance drops

      return null;
    },

    decorations(state) {
      const { selection } = state;
      const { $anchor } = selection;

      if (selection instanceof TextSelection) {
        // get the table
        const result = getDepthByContentType($anchor, "table");

        if (!result) return DecorationSet.empty;

        const { node, depth } = result;

        const before = $anchor.before(depth);
        const after = before + node.nodeSize;

        const dec = Decoration.node(before, after, { class: "active-table" });

        return DecorationSet.create(state.tr.doc, [dec]);
      }

      if (selection instanceof CellSelection) {
        const before = selection.$anchorCell.before(-1);
        const after = selection.$anchorCell.after(-1);

        const dec = Decoration.node(before, after, { class: "active-table" });

        return DecorationSet.create(state.tr.doc, [dec]);
      }
    },
  },

  view(view) {
    const down = (e) => {
      const { tr } = view.state;
      const { dispatch } = view;

      // get the cell DOM
      const cell = e.target.closest("td, th");

      if (!cell) return;

      const { setMouseState } = mainStore.getState();

      const { before, start, end } = getCellDataFromDOM(view, cell);

      const tableDOM = cell.closest(".block-table");
      if (!tableDOM) return;

      const tableID = tableDOM.getAttribute("data-id");

      setMouseState(DOWN);

      // when mouse is down, not down and up, just down
      // I need to make a selection
      // Either I need to place the caret at the start of the cell
      // or at the position in which the user has pressed the mouse down
      mousedownOnCell(e, view, tr, dispatch, start, end);

      const handleMouseLeave = () => {
        const { mouseState, setMouseState, setOperation } =
          mainStore.getState();

        if (mouseState === DOWN) {
          const { tr } = view.state;
          const { dispatch } = view;

          tr.setMeta(CELL_SELECTING, {
            isCellSelecting: true,
            tableID,
            anchorPos: before,
          });
          tr.setSelection(CellSelection.create(tr.doc, before));
          dispatch(tr);

          setMouseState(DRAG);
          setOperation(CELL_SELECTING);
        }

        if (mouseState !== DOWN) {
          tr.setMeta(CELL_SELECTING, {
            isCellSelecting: false,
            tableID: null,
            anchorPos: null,
          });

          dispatch(tr);
        }

        cell.removeEventListener("mouseleave", handleMouseLeave);
      };

      cell.addEventListener("mouseleave", handleMouseLeave);
    };

    const move = (e) => {
      const { operation } = mainStore.getState();

      if (operation === CELL_SELECTING) {
        const cell = e.target.closest("td, th");

        // I am looking for a viable cell. That is all I need to do
        if (!cell) return;

        const currentTableDOM = cell.closest(".block-table");
        if (!currentTableDOM) return;

        const { tableID, anchorPos } = CellSelecting_Key.getState(view.state);

        const currentTableID = currentTableDOM.getAttribute("data-id");
        if (tableID !== currentTableID) return;

        const { tr } = view.state;
        const { dispatch } = view;

        const cellSelection = CellSelection.create(
          tr.doc,
          anchorPos,
          view.posAtDOM(cell) - 1,
        );
        tr.setSelection(cellSelection);
        dispatch(tr);
      }
    };

    const up = () => {
      const { tr } = view.state;
      const { dispatch } = view;

      const { setMouseState, setOperation } = mainStore.getState();

      dispatch(
        tr.setMeta(CELL_SELECTING, {
          isCellSelecting: false,
          tableID: null,
          anchorPos: null,
        }),
      );

      setMouseState(IDLE);
      setOperation(null);
    };

    document.addEventListener("mousedown", down);
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);

    return {
      update(view) {
        const { selection } = view.state;

        if (selection instanceof TextSelection) {
          const { $anchor } = selection;

          const result = getDepthByNodeType($anchor, "content");

          if (!result) return;

          // here we have some sort of cell node
          const { depth } = result;
          const before = $anchor.before(depth);
          const cellDOM = view.domAtPos(before + 1);

          if (!cellDOM) return;

          const containerDOM = cellDOM.node.closest(".tableWrapper");

          // review: for some reason, the .block-table disappears in the init stage
          // review: therefore, I need this guard
          if (!containerDOM) return;

          setTableControls(containerDOM, cellDOM.node, cellDOM.node);
        }

        if (selection instanceof CellSelection) {
          const anchorPos = selection.$anchorCell.pos + 1;
          const headPos = selection.$headCell.pos + 1;

          const anchorCellDOM = view.domAtPos(anchorPos);
          const headCellDOM = view.domAtPos(headPos);

          if (anchorCellDOM.node && headCellDOM.node) {
            const containerDOM = headCellDOM.node.closest(".tableWrapper");

            setTableControls(
              containerDOM,
              anchorCellDOM.node,
              headCellDOM.node,
            );
          }
        }
      },

      destroy() {
        document.removeEventListener("mousedown", down);
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
      },
    };
  },
});

export default CellSelecting_Plugin;

// import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
// import { CellSelection } from "prosemirror-tables";
// import { DecorationSet, Decoration } from "@tiptap/pm/view";

// import mainStore from "../../../../stores/mainStore";
// import cellSelectingStore from "../stores/cellSelectingStore";

// import { getDepthByNodeType } from "../../../utils/depth/getDepthByNodeType";
// import { getDepthByContentType } from "../../../utils/depth/getDepthByContentType";

// // todo: left click, disallow scrolling, only 1 operation
// // todo: add an raf that allows scrolling to occur in the table
// // idea: still thinking if I should use plugin's state for anchor/head pos

// const IDLE = "IDLE";
// const DOWN = "DOWN";
// // idea: difference between move and drag
// const CELL_SELECTING = "CELL_SELECTING";
// const HIDE_NATIVE_SELECTION = "HIDE_NATIVE_SELECTION";

// const setTableControls = (container, anchorCell, headCell) => {
//   const box = container.querySelector(".selection-box");

//   const containerRect = container.getBoundingClientRect();
//   const anchorRect = anchorCell.getBoundingClientRect();
//   const headRect = headCell.getBoundingClientRect();

//   const top = Math.min(anchorRect.top, headRect.top);
//   const bottom = Math.max(anchorRect.bottom, headRect.bottom);
//   const left = Math.min(anchorRect.left, headRect.left);
//   const right = Math.max(anchorRect.right, headRect.right);

//   box.style.top = top - containerRect.top + "px";
//   box.style.left = left - containerRect.left + container.scrollLeft + "px";
//   box.style.width = right - left + "px";
//   box.style.height = bottom - top + "px";

//   const columnButton = container.querySelector(".column-button");
//   const cellIndex = headCell.cellIndex;
//   columnButton.setAttribute("data-index", cellIndex);
//   columnButton.style.top = 0 + "px";
//   columnButton.style.left =
//     headRect.left -
//     containerRect.left +
//     container.scrollLeft +
//     headRect.width / 2 +
//     "px";

//   const contentWrapper = container.parentNode;
//   const rowButton = contentWrapper.querySelector(".row-button");
//   const rowIndex = headCell.parentNode.rowIndex;
//   rowButton.setAttribute("data-index", rowIndex);
//   rowButton.style.top =
//     headRect.top - containerRect.top + headRect.height / 2 + "px";
//   rowButton.style.left = 0 + "px";
// };

// const isInclusive = (pos, from, to) => {
//   return pos >= from && pos <= to;
// };

// const mousedownOnCell = (e, view, tr, dispatch, start, end) => {
//   const clickedPos = view.posAtCoords({ left: e.clientX, top: e.clientY });

//   if (!clickedPos || !isInclusive(clickedPos.pos, start, end)) {
//     const textSelection = TextSelection.create(tr.doc, start);

//     tr.setSelection(textSelection);

//     dispatch(tr);
//   } else {
//     const textSelection = TextSelection.create(tr.doc, clickedPos.pos);

//     tr.setSelection(textSelection);

//     dispatch(tr);
//   }
// };

// const CellSelecting_Key = new PluginKey("CellSelecting_Key");

// const CellSelecting_Plugin = new Plugin({
//   key: CellSelecting_Key,

//   state: {
//     init() {
//       return {
//         isCellSelecting: false,
//         anchorPos: null,
//       };
//     },

//     apply(tr, value) {
//       // const hideSelection = tr.getMeta(HIDE_NATIVE_SELECTION);

//       // if (hideSelection) return hideSelection;

//       const cellSelecting = tr.getMeta(CELL_SELECTING);

//       if (cellSelecting) return cellSelecting;

//       return value;
//     },
//   },

//   props: {
//     // review: hide the highlights when cell selecting is conducted
//     attributes(state) {
//       const { selection } = state;

//       const cellSelecting = CellSelecting_Key.getState(state);

//       if (cellSelecting?.isHidden) {
//         return { class: "hide-native-selection" };
//       }

//       // after the mouse is up, I set the state (plugin's) to be false
//       // but when the selection is still CellSelection, I want the highlights to remain hidden
//       if (selection instanceof CellSelection) {
//         return { class: "hide-native-selection" };
//       }

//       return null;
//     },

//     // review: the job of this is to create a CellSelection when cell selecting
//     createSelectionBetween(view) {
//       const { operation } = mainStore.getState();
//       const { anchorPos, headPos } = cellSelectingStore.getState();

//       if (operation === CELL_SELECTING) {
//         if (anchorPos === headPos) {
//           return CellSelection.create(view.state.tr.doc, anchorPos);
//         }

//         if (anchorPos !== headPos) {
//           return CellSelection.create(view.state.tr.doc, anchorPos, headPos);
//         }
//       }

//       // allow the default behavior to occur
//       return null;
//     },

//     // review: the job of this is to set a decoration the active table to display the controls
//     decorations(state) {
//       const { selection } = state;
//       const { $anchor } = selection;

//       if (selection instanceof TextSelection) {
//         // get the table
//         const result = getDepthByContentType($anchor, "table");

//         if (!result) return DecorationSet.empty;

//         const { node, depth } = result;

//         const before = $anchor.before(depth);
//         const after = before + node.nodeSize;

//         const dec = Decoration.node(before, after, { class: "active-table" });

//         return DecorationSet.create(state.tr.doc, [dec]);
//       }

//       if (selection instanceof CellSelection) {
//         const before = selection.$anchorCell.before(-1);
//         const after = selection.$anchorCell.after(-1);

//         const dec = Decoration.node(before, after, { class: "active-table" });

//         return DecorationSet.create(state.tr.doc, [dec]);
//       }
//     },
//   },

//   view(view) {
//     const down = (e) => {
//       const { tr } = view.state;
//       const { dispatch } = view;

//       // get the cell DOM
//       const cell = e.target.closest("td, th");

//       if (!cell) return;

//       // e.preventDefault(); // idea:

//       const { setMouseState } = mainStore.getState();
//       const { setTableID } = cellSelectingStore.getState();

//       const before = view.posAtDOM(cell) - 1;
//       const node = view.state.doc.nodeAt(before);
//       const after = before + node.nodeSize;
//       const start = before + 2; // add and subtract by 2
//       const end = after - 2;

//       const tableDOM = cell.closest(".block-table");
//       if (!tableDOM) return;

//       const tableID = tableDOM.getAttribute("data-id");

//       setMouseState(DOWN);
//       setTableID(tableID);

//       // when mouse is down, not down and up, just down
//       // I need to make a selection
//       // Either I need to place the caret at the start of the cell
//       // or at the position in which the user has pressed the mouse down
//       mousedownOnCell(e, view, tr, dispatch, start, end);

//       const handleMouseLeave = () => {
//         const { mouseState, setOperation } = mainStore.getState();
//         const { setAnchorPos, setHeadPos, resetCellSelecting } =
//           cellSelectingStore.getState();

//         if (mouseState === DOWN) {
//           const { tr } = view.state;
//           const { dispatch } = view;

//           dispatch(tr.setMeta(HIDE_NATIVE_SELECTION, { isHidden: true }));

//           // selection was made in a cell via down
//           // mouse is held down and left
//           setOperation(CELL_SELECTING);
//           setAnchorPos(before);
//           setHeadPos(before);
//         }

//         if (mouseState !== DOWN) {
//           // reset
//           // selection was made in a cell via down
//           // but the mouse has been lifted up and left the cell
//           resetCellSelecting();
//         }

//         cell.removeEventListener("mouseleave", handleMouseLeave);
//       };

//       cell.addEventListener("mouseleave", handleMouseLeave);
//     };

//     const move = (e) => {
//       const { operation } = mainStore.getState();

//       if (operation === CELL_SELECTING) {
//         const cell = e.target.closest("td, th");

//         // I am looking for a viable cell. That is all I need to do
//         if (!cell) return;

//         const { tableID, setHeadPos } = cellSelectingStore.getState();

//         const currentTableDOM = cell.closest(".block-table");
//         if (!currentTableDOM) return;

//         const currentTableID = currentTableDOM.getAttribute("data-id");
//         if (tableID !== currentTableID) return;

//         setHeadPos(view.posAtDOM(cell) - 1);
//       }
//     };

//     const up = () => {
//       const { tr } = view.state;
//       const { dispatch } = view;

//       const { setMouseState, setOperation } = mainStore.getState();
//       const { resetCellSelecting } = cellSelectingStore.getState();

//       dispatch(tr.setMeta(HIDE_NATIVE_SELECTION, { isHidden: false }));

//       setMouseState(IDLE);
//       setOperation(null);
//       resetCellSelecting();
//     };

//     document.addEventListener("mousedown", down);
//     document.addEventListener("mousemove", move);
//     document.addEventListener("mouseup", up);

//     return {
//       update(view) {
//         const { selection } = view.state;

//         if (selection instanceof TextSelection) {
//           const { $anchor } = selection;

//           const result = getDepthByNodeType($anchor, "content");

//           if (!result) return;

//           // here we have some sort of cell node
//           const { depth } = result;
//           const before = $anchor.before(depth);
//           const cellDOM = view.domAtPos(before + 1);

//           if (!cellDOM) return;

//           const containerDOM = cellDOM.node.closest(".tableWrapper");

//           // review: for some reason, the .block-table disappears in the init stage
//           // review: therefore, I need this guard
//           if (!containerDOM) return;

//           setTableControls(containerDOM, cellDOM.node, cellDOM.node);
//         }

//         if (selection instanceof CellSelection) {
//           const anchorPos = selection.$anchorCell.pos + 1;
//           const headPos = selection.$headCell.pos + 1;

//           const anchorCellDOM = view.domAtPos(anchorPos);
//           const headCellDOM = view.domAtPos(headPos);

//           if (anchorCellDOM.node && headCellDOM.node) {
//             const containerDOM = headCellDOM.node.closest(".tableWrapper");

//             setTableControls(
//               containerDOM,
//               anchorCellDOM.node,
//               headCellDOM.node,
//             );
//           }
//         }
//       },

//       destroy() {
//         document.removeEventListener("mousedown", down);
//         document.removeEventListener("mousemove", move);
//         document.removeEventListener("mouseup", up);
//       },
//     };
//   },
// });

// export default CellSelecting_Plugin;
