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
        ctx.font = '16px "DM Mono"';
        ctx.fillStyle = "black";
        ctx.textBaseline = "top";

        const { x, y } = node.position;
        const { width, height } = node.dimension;

        ctx.strokeRect(x, y, width, height);

        const ePad = { x: 12, y: 12 };
        const bPad = { x: 4, y: 2 };
        const m = 2;

        // const nodeWidth = width - ePad.x * 2;
        // const nodeHeight = height - ePad.y * 2;
        // let initX = x + ePad.x;
        // let initY = y + ePad.y;

        const nodeWidth = width;
        const nodeHeight = height;
        let initX = x;
        let initY = y;

        let lineNum = 0;

        node.content.content.forEach((block) => {
          const blockContent = block.content;

          blockContent.forEach((content) => {
            const textContent = content.text;

            const { width: textWidth } = ctx.measureText(textContent);

            // todo
            if (textWidth < nodeWidth) {
              ctx.fillText(textContent, initX, initY + 16 * 1.6 * lineNum);

              lineNum++;
            } else {
              const words = textContent.match(/\S+|\s/g) || [];

              let currString = "";
              let prevString = "";

              words.forEach((word, i) => {
                currString += word;

                const { width: currWidth } = ctx.measureText(currString);
                const { width: wordWidth } = ctx.measureText(word);

                // review: breakage is guaranteed
                if (currWidth > nodeWidth) {
                  if (word === " ") {
                    const prevWord = words[i - 1];
                    const prevWordPlusSpace = prevWord + word;
                    const { width: prevWordPlusSpaceWidth } =
                      ctx.measureText(prevWordPlusSpace);

                    if (prevWordPlusSpaceWidth > nodeWidth) {
                      // if the previous word + " " exceeds node width
                      // -> prevWord stays and only the space to next line
                      ctx.fillText(prevWord, initX, initY + 16 * 1.6 * lineNum);

                      lineNum++;

                      currString = word;
                      prevString = currString;
                    } else if (prevWord === " ") {
                      // if the previous word is a " "
                      // -> just move the space to the next line
                      ctx.fillText(
                        prevString,
                        initX,
                        initY + 16 * 1.6 * lineNum
                      );

                      lineNum++;

                      currString = word;
                      prevString = currString;
                    } else {
                      // if " " causes exceeding, retrieve the previous word
                      // -> prevWord + " " to next line
                      prevString = prevString.slice(0, -prevWord.length);
                      ctx.fillText(
                        prevString,
                        initX,
                        initY + 16 * 1.6 * lineNum
                      );

                      lineNum++;

                      currString = prevWord + word;
                      prevString = currString;
                    }
                  } else if (wordWidth > nodeWidth) {
                    // if the previous word exceeds the node's width
                    // -> word break

                    if (prevString.length > 0) {
                      ctx.fillText(
                        prevString,
                        initX,
                        initY + 16 * 1.6 * lineNum
                      );

                      lineNum++;

                      // currString = "";
                      // prevString = "";
                    }

                    let currWord = "";
                    let prevWord = "";

                    for (let i = 0; i < word.length; i++) {
                      const char = word[i];

                      currWord += char;

                      const { width: currWordWidth } =
                        ctx.measureText(currWord);

                      if (currWordWidth > nodeWidth) {
                        ctx.fillText(
                          prevWord,
                          initX,
                          initY + 16 * 1.6 * lineNum
                        );

                        lineNum++;

                        currWord = char;
                        prevWord = char;
                      } else {
                        prevWord = currWord;
                      }

                      if (i === word.length - 1) {
                        currString = prevWord;
                        prevString = prevWord;
                      }
                    }
                  } else {
                    // if word causes overflow
                    // -> word jumps to next line
                    ctx.fillText(prevString, initX, initY + 16 * 1.6 * lineNum);

                    lineNum++;

                    currString = word;
                    prevString = word;
                  }
                } else {
                  prevString = currString;
                }

                if (i === words.length - 1) {
                  ctx.fillText(prevString, initX, initY + 16 * 1.6 * lineNum);

                  lineNum += 1;
                }
              });

              // debug
              console.log("words", words);
            }
            // todo
          });
        });
      }
    };

    draw();
  }, [ref, wrapperRect, panOffsetCoords, scale]);

  return <canvas id="whiteboard-canvas" ref={ref} />;
};

export default WhiteboardCanvas;
