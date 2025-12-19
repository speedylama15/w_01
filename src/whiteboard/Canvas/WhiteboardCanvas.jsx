import { useEffect } from "react";

import useSetCanvasDimension from "../../hooks/useSetCanvasDimension.jsx";

import useWrapperRect from "../../stores/useWrapperRect.js";
import usePanning from "../../stores/usePanning.js";

import { content } from "../../data/content.js";

const node = {
  shape: "rect",
  position: { x: 0, y: 0 },
  dimension: { width: 500, height: 400 },
  content,
};

const WhiteboardCanvas = ({ ref }) => {
  const wrapperRect = useWrapperRect((state) => state.wrapperRect);

  const scale = usePanning((state) => state.scale);
  const panOffsetCoords = usePanning((state) => state.panOffsetCoords);

  useSetCanvasDimension(ref);

  useEffect(() => {
    const draw = async () => {
      await document.fonts.load('18px "DM Mono"');

      const canvas = ref.current;
      const ctx = canvas.getContext("2d");
      const dpr = window.devicePixelRatio || 1;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);
      ctx.translate(panOffsetCoords.x, panOffsetCoords.y);
      ctx.scale(scale, scale);

      // Set font once
      ctx.font = 'normal 16px "DM Mono"';
      ctx.fillStyle = "black";
      ctx.textBaseline = "top";

      const { x, y } = node.position;
      const { width, height } = node.dimension;

      ctx.strokeRect(x, y, width, height);

      const nodeWidth = width;

      let lineNum = 0;

      JSON.parse(localStorage.getItem("editor")).content.forEach((block) => {
        const blockContent = block.content;

        blockContent.forEach((content) => {
          const textContent = content.text;

          const { width: textWidth } = ctx.measureText(textContent);

          // todo
          if (textWidth < nodeWidth) {
            ctx.fillText(textContent, x, y + 16 * 1.6 * lineNum);

            lineNum++;
          } else {
            const words = textContent.match(/\S+|\s/g) || [];

            let currLine = "";
            let prevLine = "";

            words.forEach((word, i) => {
              currLine += word;

              const currLineWidth = ctx.measureText(currLine).width;
              const wordWidth = ctx.measureText(word).width;

              if (currLineWidth > nodeWidth) {
                if (word !== " ") {
                  if (prevLine !== "") {
                    ctx.fillText(prevLine, x, y + 16 * 1.6 * lineNum);
                    lineNum++;
                    currLine = "";
                    prevLine = "";
                  }

                  if (wordWidth > nodeWidth) {
                    let currWord = "";
                    let prevWord = "";

                    // break the word
                    for (let i = 0; i < word.length; i++) {
                      const char = word[i];
                      currWord += char;

                      const currWordWidth = ctx.measureText(currWord).width;

                      if (currWordWidth > nodeWidth) {
                        ctx.fillText(prevWord, x, y + 16 * 1.6 * lineNum);

                        lineNum++;

                        currWord = char;
                        prevWord = char;
                      } else {
                        prevWord = currWord;
                      }

                      if (i === word.length - 1) {
                        currLine = currWord;
                        prevLine = currWord;
                      }
                    }
                  } else if (wordWidth <= nodeWidth) {
                    currLine = word;
                    prevLine = currLine;
                  }
                }

                // review: " " broke it
                if (word === " ") {
                  const prevWord = words[i - 1];
                  const prevWordPlusSpace = prevWord + word;
                  const prevWordPlusSpaceWidth =
                    ctx.measureText(prevWordPlusSpace).width;

                  if (prevWord === " ") {
                    ctx.fillText(prevLine, x, y + 16 * 1.6 * lineNum);
                    lineNum++;
                    currLine = word;
                    prevLine = currLine;
                  } else if (prevWordPlusSpaceWidth < nodeWidth) {
                    const slicedPrevLine = prevLine.slice(0, -prevWord.length);

                    ctx.fillText(slicedPrevLine, x, y + 16 * 1.6 * lineNum);
                    lineNum++;
                    currLine = prevWord + word;
                    prevLine = currLine;
                  } else if (prevWordPlusSpaceWidth >= nodeWidth) {
                    ctx.fillText(prevLine, x, y + 16 * 1.6 * lineNum);
                    lineNum++;
                    currLine = word;
                    prevLine = currLine;
                  }
                }
              } else {
                prevLine = currLine;
              }

              // reaches the end of the block
              // render all the remaining line
              if (i === words.length - 1) {
                ctx.fillText(currLine, x, y + 16 * 1.6 * lineNum);

                lineNum += 1;
              }
            });
          }
        });
      });
    };

    if (wrapperRect.x && ref?.current) {
      draw();
    }
  }, [ref, wrapperRect, panOffsetCoords, scale]);

  return <canvas id="whiteboard-canvas" ref={ref} />;
};

export default WhiteboardCanvas;
