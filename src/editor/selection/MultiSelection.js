import { Fragment, Slice } from "prosemirror-model";
import { Selection, TextSelection } from "prosemirror-state";
import MultiBookmark from "./MultiBookmark";

class MultiSelection extends Selection {
  blocks = []; // I need this for content()
  nodes = [];

  constructor($from, $to) {
    super($from, $to);

    $from.doc.nodesBetween($from.pos, $to.pos, (node, pos, parent, index) => {
      if (node.attrs.nodeType === "block") {
        this.blocks.push(node);

        this.nodes.push({
          before: pos,
          after: pos + node.nodeSize,
          node,
          index,
        });

        return false;
      }
    });
  }

  static create(doc, from, to = from) {
    const $from = doc.resolve(from);
    const $to = doc.resolve(to);

    const arr = [];

    $from.doc.nodesBetween($from.pos, $to.pos, (node, pos) => {
      if (node.attrs.nodeType === "block") {
        arr.push({ before: pos, after: pos + node.nodeSize });

        return false;
      }
    });

    // get the nearest valid selection
    if (!arr.length) return Selection.near($from);

    // ResolvedPos objects provide contextual data around that pos
    return new MultiSelection(
      doc.resolve(arr[0].before),
      doc.resolve(arr[arr.length - 1].after),
    );
  }

  // slice that represents the selected content
  // gets used users you copy or cut
  content() {
    return new Slice(Fragment.from(this.blocks), 0, 0);
  }

  // compare selections for whatever reason
  eq(selection) {
    if (!(selection instanceof MultiSelection)) {
      return false;
    }

    if (this.nodes.length !== selection.nodes.length) {
      return false;
    }

    if (this.from !== selection.from || this.to !== selection.to) {
      return false;
    }

    // review: Node instance also has an eq() function
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

    return new MultiSelection(
      doc.resolve(fromResult.pos),
      doc.resolve(toResult.pos),
    );
  }

  // stringifies
  toJSON() {
    return {
      type: "multiSelection",
      anchor: this.anchor,
      head: this.head,
    };
  }

  // takes what toJSON produced
  static fromJSON(doc, json) {
    // invokes create()
    // constructor() constructs both nodes and positions
    return MultiSelection.create(doc, json.anchor, json.head);
  }

  getBookmark() {
    return new MultiBookmark(this.anchor, this.head);
  }

  // controls whether the selected range should be visible to the user in the browser
  // You'd override it to return false if you want a custom selection type that doesn't show the native browser highlight
  // review: even with this, the native highlight still shows
  get visible() {
    return false;
  }
}

Selection.jsonID("multiSelection", MultiSelection);

export default MultiSelection;
