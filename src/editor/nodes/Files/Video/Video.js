import { Node, mergeAttributes } from "@tiptap/core";

const name = "video";

// todo: marks
// todo: add node view for resizing and alignment funtionalities

const Video = Node.create({
  name,
  group: "block file",
  atom: true,
  inline: false,
  selectable: true,

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
      videoSrc: {
        // fix
        default: "https://www.w3schools.com/html/mov_bbb.mp4",
        parseHTML: (element) => element.getAttribute("src"),
        renderHTML: (attributes) => ({
          src: attributes.videoSrc,
        }),
      },
      videoAlignment: {
        default: "center",
        parseHTML: (element) => element.getAttribute("data-video-alignment"),
        renderHTML: (attributes) => ({
          "data-video-alignment": attributes.videoAlignment,
        }),
      },
      videoWidth: {
        // review: maybe I should have it be 100%
        default: "100%",
        parseHTML: (element) => element.getAttribute("data-video-width"),
        renderHTML: (attributes) => ({
          "data-video-width": attributes.videoWidth,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: `div[data-content-type="${name}"]` }, { tag: "video" }];
  },

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
          style: `width: ${HTMLAttributes["data-video-width"]};`,
        },
        [
          "div",
          { class: "video-wrapper" },
          [
            "video",
            {
              src: HTMLAttributes.src,
              controls: true,
            },
          ],
        ],
      ],
    ];
  },
});

export default Video;
