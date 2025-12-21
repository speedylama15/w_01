import { Node, mergeAttributes } from "@tiptap/core";
import * as pdfjsLib from "pdfjs-dist";

const name = "pdf";

// todo: marks
// todo: add node view for resizing and alignment funtionalities

const renderPDF = async (
  canvas,
  src = "https://arxiv.org/pdf/2301.07041.pdf",
  pageNum = 1,
  width = 400
) => {
  // fix: warning fake worker
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "//mozilla.github.io/pdf.js/build/pdf.worker.mjs";

  const pdf = await pdfjsLib.getDocument(src).promise;

  // fix: make this an attribute
  const page = await pdf.getPage(pageNum);

  const context = canvas.getContext("2d");

  const viewport = page.getViewport({ scale: 1 });
  // fix: make this an attribute
  const scale = width / viewport.width;
  const scaledViewport = page.getViewport({ scale });

  canvas.width = scaledViewport.width;
  canvas.height = scaledViewport.height;

  await page.render({
    canvasContext: context,
    viewport: scaledViewport,
  }).promise;
};

// review
const getHTML_Attributes = (HTMLAttributes) => {
  const html_attributes = {};

  Object.entries(HTMLAttributes).forEach((entry) => {
    const key = entry[0];
    const value = entry[1];

    if (key !== "src") html_attributes[key] = value;
  });

  return html_attributes;
};
// review

const PDF = Node.create({
  name,
  group: "block file",
  atom: true,
  inline: false,
  selectable: true,

  addNodeView() {
    return ({ HTMLAttributes }) => {
      const block = document.createElement("div");
      const content = document.createElement("div");
      const wrapper = document.createElement("div");
      const canvas = document.createElement("canvas");

      const { blockAttrs, contentAttrs } = this.options;
      const html_attributes = getHTML_Attributes(HTMLAttributes);

      Object.entries(html_attributes).forEach((entry) => {
        const key = entry[0];
        const value = entry[1];

        block.setAttribute(key, value);
      });

      Object.entries(blockAttrs).forEach((entry) => {
        const key = entry[0];
        const value = entry[1];

        block.setAttribute(key, value);
      });

      Object.entries(contentAttrs).forEach((entry) => {
        const key = entry[0];
        const value = entry[1];

        content.setAttribute(key, value);
      });

      // review: set the width of content and wrapper divs
      const width = HTMLAttributes["data-pdf-width"];
      content.style.width = width + "px";
      wrapper.style.width = width + "px";
      wrapper.className = "pdf-wrapper";

      block.append(content);
      content.append(wrapper);
      wrapper.append(canvas);

      // review: width of canvas is set here
      const src = HTMLAttributes.src;
      const pageNum = HTMLAttributes["data-pdf-page-num"];
      renderPDF(canvas, src, pageNum, width);

      console.log(HTMLAttributes);

      return {
        dom: block,
        destroy: () => {},
      };
    };
  },

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
        default: "https://arxiv.org/pdf/2301.07041.pdf",
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
        default: 500,
        parseHTML: (element) => element.getAttribute("data-pdf-width"),
        renderHTML: (attributes) => ({
          "data-pdf-width": attributes.pdfWidth,
        }),
      },
      pdfPageNum: {
        default: 1,
        parseHTML: (element) => element.getAttribute("data-pdf-page-num"),
        renderHTML: (attributes) => ({
          "data-pdf-page-num": attributes.pdfPageNum,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: `div[data-content-type="${name}"]` }];
  },

  // fix: renderHTML needs to be better...
  renderHTML({ HTMLAttributes }) {
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
        },
        ["div", { class: "pdf-wrapper" }, []],
      ],
    ];
  },
});

export default PDF;
