import { Plugin, PluginKey } from "@tiptap/pm/state";
import { ReactRenderer } from "@tiptap/react";

import SlashMenu from "./SlashMenu.jsx";

// review: instead of having a React component listen to transaction
// review: render the React component inside of view's update()
// idea: create a factory function in which receives editor arg

export const SlashMenu_Key = new PluginKey("SlashMenu_Key");

export const createNodeMenuPlugin = (editor) => {
  return new Plugin({
    key: SlashMenu_Key,

    state: {
      init() {
        return {
          isActive: false,
        };
      },

      apply(tr, value) {
        const initNodeMenu = tr.getMeta("init-node_menu");
        const closeNodeMenu = tr.getMeta("close-node_menu");

        if (initNodeMenu) return initNodeMenu;
        if (closeNodeMenu) return closeNodeMenu;

        return value;
      },
    },

    props: {
      handleKeyDown(view, e) {
        const { tr } = view.state;
        const { dispatch } = view;

        const isSpace = e.code === "Space";
        const isShift = e.shiftKey;

        const noOtherModifiers = !e.ctrlKey && !e.metaKey && !e.altKey;

        if (isSpace && isShift && noOtherModifiers) {
          dispatch(tr.setMeta("init-node_menu", { isActive: true }));

          return true;
        }
        //
      },
    },

    view() {
      let component = null;

      return {
        update(view, prevState) {
          const pluginState = SlashMenu_Key.getState(view.state);
          const prevPluginState = SlashMenu_Key.getState(prevState);

          // isActive: false -> true
          // create the component and append
          if (pluginState?.isActive && component === null) {
            component = new ReactRenderer(SlashMenu, {
              editor,
              props: {
                editor,
                selection: view.state.selection,
              },
            });

            document.body.append(component.element);

            return;
          }

          // isActive: true -> false
          // hide the menu
          if (prevPluginState?.isActive && !pluginState?.isActive) {
            if (component) {
              component.destroy();
              component.element.remove();

              component = null;
            }

            return;
          }

          // 3. UPDATE: It's still active, just sync the props
          //   if (pluginState?.isActive && component) {
          //     component.updateProps(pluginState);
          //   }
          //
        },

        destroy() {
          if (component) {
            component.destroy();
            component.element.remove();
          }
        },
      };
    },
  });
};

// import { Plugin, PluginKey } from "@tiptap/pm/state";
// import { DecorationSet, Decoration } from "@tiptap/pm/view";

// export const SlashMenu_Key = new PluginKey("SlashMenu_Key");

// export const SlashMenu_Plugin = new Plugin({
//   key: SlashMenu_Key,

//   state: {
//     init() {
//       return { isActive: false, from: null, to: null, query: "" };
//     },

//     apply(tr, value) {
//       const initSlash = tr.getMeta("init-slash");
//       const cancelSlash = tr.getMeta("cancel-slash");

//       if (initSlash) return initSlash;
//       if (cancelSlash) return cancelSlash;

//       if (value?.isActive) {
//         const { $from } = tr.selection;

//         // either fetch the query
//         const query = $from.doc.textBetween(value?.from + 1, $from.pos);

//         if (query.length <= 15) {
//           return {
//             ...value,
//             query,
//             to: $from.pos,
//           };
//         }

//         // or de-activate the menu
//         return { isActive: false, query: "", from: null, to: null };
//       }

//       return value;
//     },
//   },

//   props: {
//     decorations(state) {
//       const pluginState = SlashMenu_Key.getState(state);

//       if (!pluginState?.isActive) return DecorationSet.empty;

//       return DecorationSet.create(state.doc, [
//         Decoration.inline(pluginState?.from, pluginState?.to, {
//           class: "slash",
//         }),
//       ]);
//     },

//     handleKeyDown(view, e) {
//       const { tr } = view.state;
//       const { dispatch } = view;

//       if (e.key === "/") {
//         tr.setMeta("init-slash", {
//           isActive: true,
//           from: view.state.selection.from,
//           to: view.state.selection.from + 1,
//           query: "",
//         });

//         dispatch(tr);
//       }

//       if (e.key === "Backspace") {
//         const pluginState = SlashMenu_Key.getState(view.state);

//         if (pluginState?.from === view.state.selection.from - 1) {
//           tr.setMeta("cancel-slash", {
//             isActive: false,
//             from: null,
//             to: null,
//             query: "",
//           });

//           dispatch(tr);
//         }
//       }
//     },
//   },

//   view() {
//     return {
//       update(view, prevState) {
//         const pluginState = SlashMenu_Key.getState(view.state);
//         const { isActive, from, to } = pluginState;

//         if (isActive && from !== null && from !== to) {
//           const { node: dom } = view.domAtPos(pluginState.from);
//           const coords = view.coordsAtPos(pluginState.from);
//         }

//         if (!isActive && from === null && to === null) {
//           //
//         }

//         //
//       },
//     };
//   },
//   //
// });
