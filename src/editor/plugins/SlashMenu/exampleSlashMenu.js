import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { findSuggestionMatch as defaultFindSuggestionMatch } from "./findSuggestionMatch.js";

export const SuggestionPluginKey = new PluginKey("suggestion");

export function Suggestion({
  pluginKey = SuggestionPluginKey,
  editor,
  char = "@",
  allowSpaces = false,
  allowToIncludeChar = false,
  allowedPrefixes = [" "],
  startOfLine = false,
  decorationTag = "span",
  decorationClass = "suggestion",
  decorationContent = "",
  decorationEmptyClass = "is-empty",
  command = () => null,
  items = () => [],
  render = () => ({}),
  allow = () => true,
  findSuggestionMatch = defaultFindSuggestionMatch,
  shouldShow,
}) {
  let props;
  const renderer = render?.();

  const getAnchorClientRect = () => {
    const pos = editor.state.selection.$anchor.pos;
    const coords = editor.view.coordsAtPos(pos);
    const { top, right, bottom, left } = coords;

    try {
      return new DOMRect(left, top, right - left, bottom - top);
    } catch {
      return null;
    }
  };

  const clientRectFor = (view, decorationNode) => {
    if (!decorationNode) {
      return getAnchorClientRect;
    }

    return () => {
      const state = pluginKey.getState(editor.state);
      const decorationId = state?.decorationId;
      const currentDecorationNode = view.dom.querySelector(
        `[data-decoration-id="${decorationId}"]`,
      );

      return currentDecorationNode?.getBoundingClientRect() || null;
    };
  };

  function dispatchExit(view, pluginKeyRef) {
    try {
      const state = pluginKey.getState(view.state);
      const decorationNode = state?.decorationId
        ? view.dom.querySelector(`[data-decoration-id="${state.decorationId}"]`)
        : null;

      const exitProps = {
        editor,
        range: state?.range || { from: 0, to: 0 },
        query: state?.query || null,
        text: state?.text || null,
        items: [],
        command: (commandProps) => {
          return command({
            editor,
            range: state?.range || { from: 0, to: 0 },
            props: commandProps,
          });
        },
        decorationNode,
        clientRect: clientRectFor(view, decorationNode),
      };

      renderer?.onExit?.(exitProps);
    } catch {
      // ignore errors from consumer renderers
    }

    const tr = view.state.tr.setMeta(pluginKeyRef, { exit: true });
    view.dispatch(tr);
  }

  const plugin = new Plugin({
    key: pluginKey,

    view() {
      return {
        update: async (view, prevState) => {
          const prev = this.key?.getState(prevState);
          const next = this.key?.getState(view.state);

          const moved =
            prev.active && next.active && prev.range.from !== next.range.from;
          const started = !prev.active && next.active;
          const stopped = prev.active && !next.active;
          const changed = !started && !stopped && prev.query !== next.query;

          const handleStart = started || (moved && changed);
          const handleChange = changed || moved;
          const handleExit = stopped || (moved && changed);

          if (!handleStart && !handleChange && !handleExit) {
            return;
          }

          const state = handleExit && !handleStart ? prev : next;
          const decorationNode = view.dom.querySelector(
            `[data-decoration-id="${state.decorationId}"]`,
          );

          props = {
            editor,
            range: state.range,
            query: state.query,
            text: state.text,
            items: [],
            command: (commandProps) => {
              return command({
                editor,
                range: state.range,
                props: commandProps,
              });
            },
            decorationNode,
            clientRect: clientRectFor(view, decorationNode),
          };

          if (handleStart) {
            renderer?.onBeforeStart?.(props);
          }

          if (handleChange) {
            renderer?.onBeforeUpdate?.(props);
          }

          if (handleChange || handleStart) {
            props.items = await items({
              editor,
              query: state.query,
            });
          }

          if (handleExit) {
            renderer?.onExit?.(props);
          }

          if (handleChange) {
            renderer?.onUpdate?.(props);
          }

          if (handleStart) {
            renderer?.onStart?.(props);
          }
        },

        destroy: () => {
          if (!props) {
            return;
          }

          renderer?.onExit?.(props);
        },
      };
    },

    state: {
      init() {
        return {
          active: false,
          range: { from: 0, to: 0 },
          query: null,
          text: null,
          composing: false,
        };
      },

      apply(transaction, prev, _oldState, state) {
        const { isEditable } = editor;
        const { composing } = editor.view;
        const { selection } = transaction;
        const { empty, from } = selection;
        const next = { ...prev };

        const meta = transaction.getMeta(pluginKey);
        if (meta && meta.exit) {
          next.active = false;
          next.decorationId = null;
          next.range = { from: 0, to: 0 };
          next.query = null;
          next.text = null;

          return next;
        }

        next.composing = composing;

        if (isEditable && (empty || editor.view.composing)) {
          if (
            (from < prev.range.from || from > prev.range.to) &&
            !composing &&
            !prev.composing
          ) {
            next.active = false;
          }

          const match = findSuggestionMatch({
            char,
            allowSpaces,
            allowToIncludeChar,
            allowedPrefixes,
            startOfLine,
            $position: selection.$from,
          });
          const decorationId = `id_${Math.floor(Math.random() * 0xffffffff)}`;

          if (
            match &&
            allow({
              editor,
              state,
              range: match.range,
              isActive: prev.active,
            }) &&
            (!shouldShow ||
              shouldShow({
                editor,
                range: match.range,
                query: match.query,
                text: match.text,
                transaction,
              }))
          ) {
            next.active = true;
            next.decorationId = prev.decorationId
              ? prev.decorationId
              : decorationId;
            next.range = match.range;
            next.query = match.query;
            next.text = match.text;
          } else {
            next.active = false;
          }
        } else {
          next.active = false;
        }

        if (!next.active) {
          next.decorationId = null;
          next.range = { from: 0, to: 0 };
          next.query = null;
          next.text = null;
        }

        return next;
      },
    },

    props: {
      handleKeyDown(view, event) {
        const { active, range } = plugin.getState(view.state);

        if (!active) {
          return false;
        }

        if (event.key === "Escape" || event.key === "Esc") {
          const state = plugin.getState(view.state);
          const cachedNode = props?.decorationNode ?? null;
          const decorationNode =
            cachedNode ??
            (state?.decorationId
              ? view.dom.querySelector(
                  `[data-decoration-id="${state.decorationId}"]`,
                )
              : null);

          const handledByKeyDown =
            renderer?.onKeyDown?.({ view, event, range: state.range }) || false;

          if (handledByKeyDown) {
            return true;
          }

          const exitProps = {
            editor,
            range: state.range,
            query: state.query,
            text: state.text,
            items: [],
            command: (commandProps) => {
              return command({
                editor,
                range: state.range,
                props: commandProps,
              });
            },
            decorationNode,
            clientRect: decorationNode
              ? () => {
                  return decorationNode.getBoundingClientRect() || null;
                }
              : null,
          };

          renderer?.onExit?.(exitProps);
          dispatchExit(view, pluginKey);

          return true;
        }

        const handled = renderer?.onKeyDown?.({ view, event, range }) || false;
        return handled;
      },

      decorations(state) {
        const { active, range, decorationId, query } = plugin.getState(state);

        if (!active) {
          return null;
        }

        const isEmpty = !query?.length;
        const classNames = [decorationClass];

        if (isEmpty) {
          classNames.push(decorationEmptyClass);
        }

        return DecorationSet.create(state.doc, [
          Decoration.inline(range.from, range.to, {
            nodeName: decorationTag,
            class: classNames.join(" "),
            "data-decoration-id": decorationId,
            "data-decoration-content": decorationContent,
          }),
        ]);
      },
    },
  });

  return plugin;
}

export function exitSuggestion(view, pluginKeyRef = SuggestionPluginKey) {
  const tr = view.state.tr.setMeta(pluginKeyRef, { exit: true });
  view.dispatch(tr);
}
