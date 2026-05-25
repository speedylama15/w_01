import { TextSelection } from "@tiptap/pm/state";
import MultiSelection from "./MultiSelection";

class MultiBookmark {
  constructor(anchor, head) {
    this.anchor = anchor;
    this.head = head;
  }

  // mapping is used for tr.mapping.map(pos)
  map(mapping) {
    return new MultiBookmark(mapping.map(this.anchor), mapping.map(this.head));
  }

  // converts the bookmark back into your custom Selection object
  resolve(doc) {
    try {
      return MultiSelection.create(doc, this.anchor, this.head);
    } catch {
      return TextSelection.between(
        doc.resolve(this.anchor),
        doc.resolve(this.head),
      );
    }
  }
}

export default MultiBookmark;
