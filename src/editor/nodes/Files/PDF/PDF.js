import { Node, mergeAttributes } from "@tiptap/core";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.mjs";

const name = "pdf";

// todo: marks
// todo: add node view for resizing and alignment funtionalities

// fix
const src = "https://arxiv.org/pdf/2301.07041.pdf";

const PDF = Node.create({
  name,
  group: "block file",
  atom: true,
  inline: false,
  selectable: true,

  // fix
  //   priority: 100000,

  addOptions() {
    return {
      blockAttrs: { class: `block block-${name}` },
      contentAttrs: {
        class: `content content-${name}`,
      },
    };
  },

  addAttributes() {
    return {
      divType: {
        default: "block",
        parseHTML: (element) => element.getAttribute("data-div-type"),
        renderHTML: (attributes) => ({
          "data-div-type": attributes.divType,
        }),
      },
      contentType: {
        default: name,
        parseHTML: (element) => element.getAttribute("data-content-type"),
        renderHTML: (attributes) => ({
          "data-content-type": attributes.contentType,
        }),
      },
      indentLevel: {
        default: 0,
        parseHTML: (element) => element.getAttribute("data-indent-level"),
        renderHTML: (attributes) => ({
          "data-indent-level": attributes.indentLevel,
        }),
      },
      pdfSrc: {
        // fix
        default: src,
        parseHTML: (element) => element.getAttribute("src"),
        renderHTML: (attributes) => ({
          src: attributes.pdfSrc,
        }),
      },
      pdfAlignment: {
        default: "center",
        parseHTML: (element) => element.getAttribute("data-pdf-alignment"),
        renderHTML: (attributes) => ({
          "data-pdf-alignment": attributes.pdfAlignment,
        }),
      },
      pdfWidth: {
        // review: maybe I should have it be 100%
        default: "100%",
        parseHTML: (element) => element.getAttribute("data-pdf-width"),
        renderHTML: (attributes) => ({
          "data-pdf-width": attributes.pdfWidth,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: `div[data-content-type="${name}"]` }];
  },

  renderHTML({ HTMLAttributes }) {
    // fix
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "//mozilla.github.io/pdf.js/build/pdf.worker.mjs";
    const result = pdfjsLib.getDocument("https://arxiv.org/pdf/2301.07041.pdf");
    console.log(result);

    // fix

    const html_attributes = {};

    Object.entries(HTMLAttributes).forEach((entry) => {
      const key = entry[0];
      const value = entry[1];

      if (key !== "src") html_attributes[key] = value;
    });

    return [
      "div",
      mergeAttributes(html_attributes, this.options.blockAttrs),
      [
        "div",
        {
          ...this.options.contentAttrs,
          style: `width: ${HTMLAttributes["data-pdf-width"]};`,
        },
        [
          "div",
          { class: "pdf-wrapper" },
          [
            "iframe",
            {
              src: HTMLAttributes.src,
              width: 500,
              height: 700,
              type: "application/pdf",
            },
          ],
        ],
      ],
    ];
  },
});

export default PDF;
