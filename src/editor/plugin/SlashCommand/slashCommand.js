import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

import SlashMenu from "../slashCommand/SlashMenu.jsx";

import { isInclusive, isPureKey } from "../../../utils";
import { getNearestNode, isCellNode } from "../../utils";
import { ReactRenderer } from "@tiptap/react";
import { ReplaceStep } from "@tiptap/pm/transform";

// fix: change the name of this
// todo: I forgot what the library is, but there is one that allows me find entries with similarities as an option?
// idea: I can make text aka the search text, an array like ["bulletList", "todoList"]
const arr = [
  { text: "paragraph", content: "Paragraph" },
  { text: "heading1", content: "Heading 1" },
  { text: "heading2", content: "Heading 2" },
  { text: "heading3", content: "Heading 3" },
  { text: "bulletList", content: "Bullet List" },
  { text: "numberedList", content: "Numbered List" },
  { text: "checklist", content: "Checklist" },
];

const getStyle = (coords) => {
  const style = `
    position: absolute;
    top: ${coords.bottom + 5 + window.scrollY}px;
    left: ${coords.left}px;
  `;

  return style;
};

const initState = {
  isActive: false,
  from: null,
  to: null,
  set: DecorationSet.empty,
};

export const slashCommandKey = new PluginKey("slashCommandKey");

const slashCommand = (editor) => {
  return new Plugin({
    key: slashCommandKey,

    state: {
      init() {
        return {
          isActive: false,
          from: null,
          to: null,
          set: DecorationSet.empty,
        };
      },

      apply(tr, value, oldState, newState) {
        const slashCommand = tr.getMeta("slashCommand");
        if (slashCommand) return slashCommand;

        const { isActive, from, to } = slashCommandKey.getState(oldState);
        if (!isActive) return value;

        // some transaction has been applied but before it has been applied slash command was active
        // now I need to discern if the command should remain active or become inactive
        // todo: was active and from has been deleted
        const mapResult = tr.mapping.mapResult(from);
        if (mapResult.deleted) {
          console.log("init pos deleted");
          return initState;
        }

        const steps = tr.steps;

        // todo: was active, caret in range of slash command, single selection, original from intact
        if (steps.length === 1 && steps[0] instanceof ReplaceStep) {
          const step = steps[0];
          const { from: stepFrom, to: stepTo } = step;

          if (stepFrom < stepTo) {
            const newTo = to - 1;
            const count = newTo - from;
            const dec = Decoration.inline(from, newTo, {
              class: count > 1 ? "non-empty-slash" : "empty-slash",
            });
            const set = DecorationSet.create(tr.doc, [dec]);

            return {
              isActive: true,
              from,
              to: newTo,
              set,
            };
          }

          if (stepFrom <= from) {
            console.log("typed behind the slash command");
            return initState;
          }

          if (stepFrom === stepTo && stepFrom >= from + 1) {
            const { slice } = step;
            const text = slice.content.textBetween(0, slice.content.size);

            // todo: deactivate if the first char is a space
            if (text === " " && stepFrom === from + 1) {
              console.log("first char is space");
              return initState;
            }

            const newTo = to + 1;
            const count = newTo - from;

            // todo: deactivate if the character count exceeds 12
            if (count > 12) {
              console.log("exceeded limit");
              return initState;
            }

            const dec = Decoration.inline(from, newTo, {
              class: count > 1 ? "non-empty-slash" : "empty-slash",
            });
            const set = DecorationSet.create(tr.doc, [dec]);

            return {
              isActive: true,
              from,
              to: newTo,
              set,
            };
          }
        }

        // todo: was active, but became range selected through something like SHIFT + Arrow
        if (newState.selection.from !== newState.selection.to) {
          console.log("range selected");
          return initState;
        }

        // todo: was active, not ranged, but not within the slash command's range? deactivate
        if (!isInclusive(newState.selection.from, from, to)) {
          console.log("not inclusive");
          return initState;
        }

        return value;
      },
    },

    props: {
      decorations(state) {
        const { set } = slashCommandKey.getState(state);

        return set;
      },

      handleDOMEvents: {
        keydown(view, e) {
          const { tr, selection } = view.state;
          const { dispatch } = view;
          const { $from } = selection;

          const { isActive } = slashCommandKey.getState(view.state);

          const isSlash = isPureKey(e, "/");
          const isESC = isPureKey(e, "Escape");

          // todo: ESC disable
          if (isActive && isESC) {
            dispatch(
              tr.setMeta("slashCommand", {
                isActive: false,
                from: null,
                to: null,
                set: DecorationSet.empty,
              }),
            );

            return;
          }

          // todo: activate
          if (isSlash && !isActive) {
            const result = getNearestNode($from);
            if (!result) return;

            const { node } = result;

            // only condition for slash command to become active
            // when it's not in a cell and the node is a text block
            if (!isCellNode(node) && node.isTextblock) {
              e.preventDefault();

              const from = $from.pos;
              const to = from + 1;

              const dec = Decoration.inline(from, to, {
                class: "empty-slash",
              });
              const set = DecorationSet.create(tr.doc, [dec]);

              console.log("activate slash"); // fix

              tr.setMeta("slashCommand", {
                isActive: true,
                from,
                to,
                set,
              }).insertText("/");
              dispatch(tr);

              document.body.style.overflow = "hidden";
            }
          }
        },
      },
    },

    view(view) {
      let menu = null;
      let index = null;

      // any keys I need to hijack
      const keydown = (e) => {
        const { isActive } = slashCommandKey.getState(view.state);
        const { tr } = view.state;
        const { dispatch } = view;

        if (!isActive) return;

        // todo: hijack arrow up
        if (e.key === "ArrowUp") {
          e.preventDefault();
          e.stopPropagation();

          console.log("block arrow up");

          index = Math.max(0, index - 1);

          menu.updateProps({ index });

          return;
        }

        // todo: hijack arrow down
        if (e.key === "ArrowDown") {
          e.preventDefault();
          e.stopPropagation();

          console.log("block arrow down");

          index = Math.min(arr.length - 1, index + 1);

          menu.updateProps({ index });

          return;
        }

        // todo: insert the appropriate node and deactivate
        if (e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();

          console.log("ENTER", arr[index]);

          tr.setMeta("slashCommand", initState);
          dispatch(tr);
        }
      };

      const scroll = () => {
        const { isActive } = slashCommandKey.getState(view.state);

        if (isActive) {
          const { tr } = view.state;
          const { dispatch } = view;

          dispatch(tr.setMeta("slashCommand", initState));
        }
      };

      window.addEventListener("scroll", scroll);
      window.addEventListener("keydown", keydown, { capture: true }); // do I have to place it on the window and set the capture?

      return {
        update(view, prevState) {
          const prev = slashCommandKey.getState(prevState);
          const curr = slashCommandKey.getState(view.state);

          // todo: render menu when activated
          if (curr.isActive && curr.isActive !== prev.isActive) {
            const coords = view.coordsAtPos(curr.from); // top, left, right, bottom

            console.log("render menu"); // fix

            index = 0;
            menu = new ReactRenderer(SlashMenu, {
              editor,
              className: "slash-menu",
              props: { editor, arr, text: "", index, to: curr.to },
            });

            menu.updateAttributes({ style: getStyle(coords) });
            document.querySelector(".portal").appendChild(menu.element);

            return;
          }

          // todo: remove the menu when deactivated
          if (!curr.isActive && curr.isActive !== prev.isActive) {
            document.body.style.overflow = "";

            index = null;
            menu.destroy();
            menu = null;
          }

          // todo: update search text
          if (curr.isActive) {
            const text = view.state.tr.doc.textBetween(curr.from + 1, curr.to);

            menu.updateProps({ text, to: curr.to });
          }
        },

        destroy() {
          window.removeEventListener("scroll", scroll);
          window.removeEventListener("keydown", keydown, { capture: true });
        },
      };
    },
  });
};

export default slashCommand;
