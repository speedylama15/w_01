import { Fragment, Slice } from "prosemirror-model";
import { Selection } from "prosemirror-state";

export class MultipleNodeSelection extends Selection {
  nodes = [];
  positions = []; // fix

  constructor($anchor, $head) {
    super($anchor, $head);

    $anchor.doc.nodesBetween($anchor.pos, $head.pos, (node, start) => {
      // I only need the block nodes
      if (node.attrs.divType === "block") {
        this.nodes.push(node);
        this.positions.push({ from: start, to: start + node.nodeSize }); // fix

        return false;
      }
    });
  }

  static create(doc, from, to = from) {
    return new MultipleNodeSelection(doc.resolve(from), doc.resolve(to));
  }

  content() {
    return new Slice(Fragment.from(this.nodes), 0, 0);
  }

  eq(selection) {
    if (!(selection instanceof MultipleNodeSelection)) {
      return false;
    }

    if (this.nodes.length !== selection.nodes.length) {
      return false;
    }

    if (this.from !== selection.from || this.to !== selection.to) {
      return false;
    }

    for (let i = 0; i < this.nodes.length; i++) {
      if (!this.nodes[i].eq(selection.nodes[i])) {
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

    return new MultipleNodeSelection(
      doc.resolve(fromResult.pos),
      doc.resolve(toResult.pos)
    );
  }

  toJSON() {
    return { type: "multiple-node", anchor: this.anchor, head: this.head };
  }
}

Selection.jsonID("multiple-node", MultipleNodeSelection);
