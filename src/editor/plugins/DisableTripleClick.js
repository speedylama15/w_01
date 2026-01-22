import { Plugin } from "@tiptap/pm/state";

export const DisableTripleClick = new Plugin({
  key: "DisableTripleClickKey",
  props: {
    handleTripleClick(view, pos, e) {
      e.preventDefault();
      e.stopPropagation();
      return true;
    },
  },
});
