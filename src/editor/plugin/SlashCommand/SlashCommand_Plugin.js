import { Plugin, PluginKey } from "@tiptap/pm/state";
import { DecorationSet, Decoration } from "@tiptap/pm/view";
import { ReplaceAroundStep, ReplaceStep } from "@tiptap/pm/transform";
import { ReactRenderer } from "@tiptap/react";

import SlashMenu from "./SlashMenu.jsx";

import { getNearestNode, isCellNode } from "../../utils";
import { isInclusive, isPureKey } from "../../../utils";

export const SlashCommand_Key = new PluginKey("SlashCommand_Key");

const slashCommand = "slashCommand";
const emptySlash = "empty-slash";
const nonEmptySlash = "non-empty-slash";

const SlashCommand_Plugin = (editor) => {
  return new Plugin({
    key: SlashCommand_Key,

    // fix: I have another appendTransaction now...
    // fix: I do think that addToHistory: false will be needed
    // because in onTransaction, I store all tr that changed the doc which do not have undo and redo meta
    // although decorations do not change the doc, still. Just to be sure.
    // idea: even if it is doc change, I still want it to be ignored in onTransaction
    // like when the user selects a ref node and makes changes to it. I don't want the user to be able to undo that
    // fix: now that means there could be positional errors...

    state: {
      init() {
        return {
          isSlashActive: false,
          from: null,
          to: null,
          set: DecorationSet.empty,
        };
      },

      apply(tr, value, oldState, newState) {
        const pluginState = SlashCommand_Key.getState(oldState);
        const { isSlashActive, from, to } = pluginState;

        const slashMeta = tr.getMeta(slashCommand);
        if (slashMeta) return slashMeta;

        if (isSlashActive && tr.docChanged) {
          const steps = tr.steps;

          // if pos gets deleted, deactivate
          if (tr.mapping.mapResult(from).deleted) {
            return {
              from: null,
              to: null,
              isSlashActive: false,
              set: DecorationSet.empty,
            };
          }

          if (steps.length === 1 && steps[0] instanceof ReplaceStep) {
            const step = steps[0];

            if (step instanceof ReplaceStep) {
              const { from: stepFrom, to: stepTo } = step;

              if (stepTo > stepFrom) {
                console.log("backspace"); // review

                const newTo = to - 1;
                const count = newTo - from;
                const inline = Decoration.inline(from, newTo, {
                  class: count === 1 ? emptySlash : nonEmptySlash,
                });
                const set = DecorationSet.create(tr.doc, [inline]);

                return {
                  isSlashActive: true,
                  from,
                  to: newTo,
                  set,
                };
              }

              // prevents the triggering from the initial "/"
              if (stepTo === stepFrom) {
                const { slice } = step;

                const textContent = slice.content.textBetween(
                  0,
                  slice.content.size,
                );

                console.log("one char"); // review

                if (textContent === " " && stepFrom === from + 1) {
                  return {
                    isSlashActive: false,
                    from: null,
                    to: null,
                    set: DecorationSet.empty,
                  };
                }

                const newTo = to + 1;
                const count = newTo - from;

                // 글자 제한
                if (count > 12) {
                  return {
                    isSlashActive: false,
                    from: null,
                    to: null,
                    set: DecorationSet.empty,
                  };
                }

                const inline = Decoration.inline(from, newTo, {
                  class: count === 1 ? emptySlash : nonEmptySlash,
                });
                const set = DecorationSet.create(tr.doc, [inline]);

                return {
                  isSlashActive: true,
                  from,
                  to: newTo,
                  set,
                };
              }
            }
          }

          console.log("deactivate"); // review
          return {
            isSlashActive: false,
            from: null,
            to: null,
            set: DecorationSet.empty,
          };
        }

        if (isSlashActive && !tr.docChanged) {
          if (newState.selection.from !== newState.selection.to) {
            return {
              from: null,
              to: null,
              isSlashActive: false,
              set: DecorationSet.empty,
            };
          }

          if (!isInclusive(newState.selection.from, from + 1, to)) {
            return {
              from: null,
              to: null,
              isSlashActive: false,
              set: DecorationSet.empty,
            };
          }
        }

        return value;
      },
    },

    props: {
      decorations(state) {
        const pluginState = this.getState(state);
        if (!pluginState) return DecorationSet.empty;

        return pluginState.set;
      },

      handleKeyDown(view, e) {
        const { tr, selection } = view.state;
        const { dispatch } = view;
        const { $from } = selection;

        const pluginState = SlashCommand_Key.getState(view.state);
        const { isSlashActive } = pluginState;

        const isSlash = isPureKey(e, "/");
        const isESC = isPureKey(e, "Escape");

        if (isESC && isSlashActive) {
          const value = {
            from: null,
            to: null,
            isSlashActive: false,
            set: DecorationSet.empty,
          };

          dispatch(tr.setMeta(slashCommand, value));

          return;
        }

        if (isSlash) {
          const result = getNearestNode($from);
          if (!result) return;

          const { node } = result;

          // text block and cannot be a cell
          if (!isCellNode(node) && node.isTextblock) {
            const from = $from.pos;
            const to = $from.pos;

            const inline = Decoration.inline(from, to, {
              class: emptySlash,
            });
            const set = DecorationSet.create(tr.doc, [inline]);

            const value = {
              isSlashActive: true,
              from,
              to,
              set,
            };

            tr.setMeta(slashCommand, value);

            dispatch(tr);

            document.body.style.overflow = "hidden"; // idea: this is enough
            // todo: note this down
            // document.querySelector(".page").style.pointerEvents = "none";
            // document.querySelector(".page").style.userSelect = "none";
            // document.querySelector(".editor-content").inert = true;
            // view.dom.inert = true;
            // document.querySelector(".page").inert = true;
            // console.log(document.querySelector(".page"));
          }
        }
      },
    },

    view(view) {
      // idea: this is a backup plan
      const scroll = () => {
        const pluginState = SlashCommand_Key.getState(view.state);

        if (pluginState.isSlashActive) {
          const { tr } = view.state;
          const { dispatch } = view;

          tr.setMeta(slashCommand, {
            isSlashActive: false,
            from: null,
            to: null,
            set: DecorationSet.empty,
          });

          dispatch(tr);
        }
      };

      const down = () => {
        const pluginState = SlashCommand_Key.getState(view.state);

        if (pluginState.isSlashActive) {
          const { tr } = view.state;
          const { dispatch } = view;

          tr.setMeta(slashCommand, {
            isSlashActive: false,
            from: null,
            to: null,
            set: DecorationSet.empty,
          });

          dispatch(tr);
        }
      };

      let renderer = null;

      window.addEventListener("scroll", scroll);
      document.addEventListener("mousedown", down);

      return {
        update(view, prevState) {
          const prevPluginState = SlashCommand_Key.getState(prevState);
          const currPluginState = SlashCommand_Key.getState(view.state);
          const { isSlashActive, from, to } = currPluginState;

          // one time thing
          if (
            isSlashActive &&
            isSlashActive !== prevPluginState.isSlashActive
          ) {
            const coords = view.coordsAtPos(from); // top, left, right, bottom

            if (!renderer) {
              renderer = new ReactRenderer(SlashMenu, {
                editor,
                props: { editor, text: "" },
                as: "div",
                className: "slash-menu",
              });
            }

            // todo: will need to use tippy or whatever it's called
            renderer.updateAttributes({
              style: `position: absolute; top: ${coords.bottom + 5 + window.scrollY}px; left: ${coords.left}px;`,
            });

            document.querySelector(".portal").appendChild(renderer.element);

            return;
          }

          if (isSlashActive) {
            const text = view.state.tr.doc.textBetween(from + 1, to);

            renderer.updateProps({ text, from, to });
          }

          // one time thing
          if (
            !isSlashActive &&
            isSlashActive !== prevPluginState.isSlashActive
          ) {
            document.body.style.overflow = "";

            if (renderer) {
              renderer.destroy();
              renderer = null;
            }
          }

          // todo: I need to set inert
        },
        destroy() {
          window.removeEventListener("scroll", scroll);
          document.removeEventListener("mousedown", down);
        },
      };
    },
  });
};

export default SlashCommand_Plugin;
