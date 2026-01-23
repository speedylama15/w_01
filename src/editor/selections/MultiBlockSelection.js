import { Fragment, Slice } from "prosemirror-model";
import { Selection } from "prosemirror-state";

export class MultiBlockSelection extends Selection {
  blocks = [];
  positions = [];

  constructor($anchor, $head) {
    super($anchor, $head);

    $anchor.doc.nodesBetween($anchor.pos, $head.pos, (node, start) => {
      if (node.attrs.nodeType === "block") {
        this.blocks.push(node);

        this.positions.push({ before: start, after: start + node.nodeSize });

        return false;
      }
    });
  }

  static create(doc, from, to = from) {
    return new MultiBlockSelection(doc.resolve(from), doc.resolve(to));
  }

  content() {
    return new Slice(Fragment.from(this.blocks), 0, 0);
  }

  eq(selection) {
    if (!(selection instanceof MultiBlockSelection)) {
      return false;
    }

    if (this.blocks.length !== selection.blocks.length) {
      return false;
    }

    if (this.from !== selection.from || this.to !== selection.to) {
      return false;
    }

    for (let i = 0; i < this.blocks.length; i++) {
      if (!this.blocks[i].eq(selection.blocks[i])) {
        return false;
      }
    }

    return true;
  }

  map(doc, mapping) {
    const fromResult = mapping.mapResult(this.from);
    const toResult = mapping.mapResult(this.to);

    if (toResult.deleted) {
      return Selection.near(doc.resolve(fromResult.pos));
    }

    if (fromResult.deleted) {
      return Selection.near(doc.resolve(toResult.pos));
    }

    return new MultiBlockSelection(
      doc.resolve(fromResult.pos),
      doc.resolve(toResult.pos)
    );
  }

  // stringifies
  toJSON() {
    return {
      type: "multi-block-selection",
      anchor: this.anchor,
      head: this.head,
    };
  }

  // takes what toJSON produced
  static fromJSON(doc, json) {
    // invokes create()
    // constructor() constructs both nodes and positions
    return MultiBlockSelection.create(doc, json.anchor, json.head);
  }
}

Selection.jsonID("multi-block-selection", MultiBlockSelection);
