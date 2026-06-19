const getTextContentFromSlice = (slice) => {
  let contents = slice;

  while (!Array.isArray(contents)) {
    contents = contents.content;
  }

  let textContent = "";

  contents.forEach((node) => (textContent += node.textContent));

  return textContent;
};

export default getTextContentFromSlice;
