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
    // from and to are integers
    // use doc.resolve() to provide ResolvedPos objects as arguments
    // ResolvedPos objects provide contextual data around that pos
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

    // IF the 'to' point was deleted...
    if (toResult.deleted) {
      // ...find a safe place to put a regular cursor near the 'from' point.
      return Selection.near(doc.resolve(fromResult.pos));
    }

    if (fromResult.deleted) {
      return Selection.near(doc.resolve(toResult.pos));
    }

    return new MultiBlockSelection(
      doc.resolve(fromResult.pos),
      doc.resolve(toResult.pos),
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

  getBookmark() {
    return new MultiBlockBookmark(this.anchor, this.head);
  }

  // prevents ProseMirror from invoking a method in which makes native selection
  get visible() {
    return false;
  }
}

Selection.jsonID("multi-block-selection", MultiBlockSelection);

class MultiBlockBookmark {
  constructor(anchor, head) {
    this.anchor = anchor;
    this.head = head;
  }

  // mapping is used for tr.mapping.map(pos)
  map(mapping) {
    return new MultiBlockBookmark(
      mapping.map(this.anchor),
      mapping.map(this.head),
    );
  }

  // converts the bookmark back into your custom Selection object
  resolve(doc) {
    return MultiBlockSelection.create(doc, this.anchor, this.head);
  }
}
