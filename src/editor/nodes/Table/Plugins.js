import { Extension } from "@tiptap/core";
import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import { CellSelection } from "@tiptap/pm/tables";
import { getNearestBlockDepth } from "../../utils/getNearestBlockDepth";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

const TableSelectionPluginKey = new PluginKey("TableSelectionPluginKey");

const createOverlay = (offsetWidth, offsetHeight, offsetTop, offsetLeft) => {
  const div = document.createElement("div");
  div.style.cssText = `
    position: absolute; 
    top: ${offsetTop}px;
    left: ${offsetLeft}px;
    background-color: transparent;
    border: 2px solid #00d52eff;
    border-radius: 2px;
    width: ${offsetWidth}px;
    height: ${offsetHeight}px;
    z-index: 100;
    transform: translate(0px, 0.5px);
  `;

  const h_button = document.createElement("button");
  const v_button = document.createElement("button");

  div.append(h_button);
  div.append(v_button);

  h_button.style.cssText = `
    position: absolute;
    top: 0px;
    left: 50%;
    transform: translate(-50%, calc(-50% - 1px));
    width: 20px;
    height: 7px;
    border: 1px solid #18b100ff;
    background-color: #fff;
    border-radius: 3px;
  `;

  v_button.style.cssText = `
    position: absolute;
    top: 50%;
    left: 0;
    transform: translate(calc(-50% - 1px), -50%) rotate(90deg);
    width: 20px;
    height: 7px;
    border: 1px solid #18b100ff;
    background-color: #fff;
    border-radius: 3px;
  `;

  return div;
};

const TableSelectionPlugin = new Plugin({
  key: TableSelectionPluginKey,

  state: {
    init() {
      return DecorationSet.empty;
    },

    // value is DecorationSet
    apply(tr, value, oldState, newState) {
      return value;
    },
  },

  props: {
    decorations(state) {
      return this.getState(state);
    },

    handleClick(view, pos, e) {
      const { dispatch } = view;
      const { tr } = view.state;

      const td = e.target.closest("td");

      if (td) {
        const table = td.closest("table");
        const tableQuery = table.querySelector(".table-overlay");

        const { offsetWidth, offsetHeight, offsetTop, offsetLeft } = td;

        tableQuery.style.display = "flex";
        tableQuery.style.width = offsetWidth + "px";
        tableQuery.style.height = offsetHeight + "px";
        tableQuery.style.top = offsetTop + "px";
        tableQuery.style.left = offsetLeft + "px";
      }
    },
  },

  view() {
    return {
      // never dispatch
      // for read-only
      update(view, prevState) {},
    };
  },
});

export const Plugins = Extension.create({
  addProseMirrorPlugins() {
    return [TableSelectionPlugin];
  },
});
