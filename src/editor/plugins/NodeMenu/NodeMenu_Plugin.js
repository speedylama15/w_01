import { Plugin, PluginKey } from "@tiptap/pm/state";
import { ReactRenderer } from "@tiptap/react";

import NodeMenu from "./NodeMenu.jsx";

// review: instead of having a React component listen to transaction
// review: render the React component inside of view's update()
// idea: create a factory function in which receives editor arg

export const NodeMenu_Key = new PluginKey("NodeMenu_Key");

export const createNodeMenuPlugin = (editor) => {
  return new Plugin({
    key: NodeMenu_Key,

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
          const pluginState = NodeMenu_Key.getState(view.state);
          const prevPluginState = NodeMenu_Key.getState(prevState);

          // isActive: false -> true
          // create the component and append
          if (pluginState?.isActive && component === null) {
            component = new ReactRenderer(NodeMenu, {
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
