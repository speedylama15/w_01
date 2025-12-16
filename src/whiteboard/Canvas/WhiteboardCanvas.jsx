import { useEffect } from "react";

import useSetCanvasDimension from "../../hooks/useSetCanvasDimension.jsx";

import useWrapperRect from "../../stores/useWrapperRect.js";
import usePanning from "../../stores/usePanning.js";

// review: the first one object needs to know the position
// review: then I add adjust the y values accordingly
const content = [
  {
    position: { x: 0, y: 0 },
    dimension: { width: 200, height: 100 },
    type: "paragraph",
    content: {
      text: "Hello World",
    },
    metadata: {
      indentLevel: 0,
    },
  },
  {
    position: { x: 0, y: 0 },
    dimension: { width: 200, height: 100 },
    type: "paragraph",
    content: {
      text: "This is a text that is rendered onto a canvas and this is going to be a pretty long sentence because I am trying to implement line break",
    },
    metadata: {
      indentLevel: 0,
    },
  },
  {
    position: { x: 0, y: 0 },
    dimension: { width: 200, height: 100 },
    type: "paragraph",
    content: {
      text: null,
    },
    metadata: {
      indentLevel: 0,
    },
  },
  {
    position: { x: 0, y: 0 },
    dimension: { width: 200, height: 100 },
    type: "paragraph",
    content: {
      text: "  Another long sentence to testa out line break and how I can implement this. Not sure how I can implement this because it seems difficult",
    },
    metadata: {
      indentLevel: 0,
    },
  },
];

const nodes = [
  {
    shape: "rect",
    position: { x: 0, y: 0 },
    dimension: { width: 450, height: 200 },
    content,
  },
];

const WhiteboardCanvas = ({ ref }) => {
  const wrapperRect = useWrapperRect((state) => state.wrapperRect);

  const scale = usePanning((state) => state.scale);
  const panOffsetCoords = usePanning((state) => state.panOffsetCoords);

  useSetCanvasDimension(ref);

  useEffect(() => {
    const draw = async () => {
      await document.fonts.load('18px "DM Mono"');

      if (ref?.current) {
        const canvas = ref.current;
        const ctx = canvas.getContext("2d");
        const dpr = window.devicePixelRatio || 1;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.scale(dpr, dpr);
        ctx.translate(panOffsetCoords.x, panOffsetCoords.y);
        ctx.scale(scale, scale);

        // Set font once
        ctx.font = '18px "DM Mono"';
        ctx.fillStyle = "black";
        ctx.textBaseline = "top";

        nodes.forEach((node, i) => {
          const { x, y } = node.position;
          const { width: nodeWidth, height: nodeHeight } = node.dimension;
          const content = node.content;

          ctx.strokeRect(x, y, nodeWidth, nodeHeight);

          let c = 0;

          content.forEach((note, i) => {
            const text = note.content.text;

            const { width: textWidth } = ctx.measureText(text);
            const percentage = textWidth / nodeWidth;

            if (percentage < 1) {
              if (text === null) {
                ctx.fillText("", x, y + i * 24);

                c += 1;

                return;
              }

              if (textWidth < nodeWidth) {
                ctx.fillText(text, x, y + i * 24);

                c += 1;

                return;
              }

              return;
            } else {
              const tokens = text.match(/\S+|\s+/g) || [];

              let w = 0;
              let s = "";

              tokens.forEach((token, tokenIndex) => {
                const { width } = ctx.measureText(token);

                w += width;

                // fix
                // when the w exceeds node's width because of a space (" ")
                // then I need the previous letter to be attached with the space
                // and placed onto the next line

                if (w > nodeWidth) {
                  ctx.fillText(s, x, y + c * 24);
                  c += 1;

                  w = width;
                  s = token;
                } else {
                  s += token;
                }

                if (tokenIndex === tokens.length - 1) {
                  ctx.fillText(s, x, y + c * 24);
                  c += 1;
                }
              });
            }
          });
        });
      }
    };

    draw();
  }, [ref, wrapperRect, panOffsetCoords, scale]);

  return <canvas id="whiteboard-canvas" ref={ref} />;
};

export default WhiteboardCanvas;
