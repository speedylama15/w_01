import { Plugin } from "@tiptap/pm/state";

// fix: not sure if I should handle

const HandleSelection_Plugin = new Plugin({
  props: {
    createSelectionBetween(view, $anchor, $head) {
      if ($anchor.pos === $head.pos) return null;

      if ($anchor.pos !== $head.pos) {
        const $from = $anchor.pos >= $head.pos ? $head : $anchor;
        const $to = $anchor.pos >= $head.pos ? $anchor : $head;

        const { tr } = view.state;

        tr.doc.nodesBetween($from.pos, $to.pos, (node, pos) => {
          //
        });
      }

      //
    },
  },
});

export default HandleSelection_Plugin;
