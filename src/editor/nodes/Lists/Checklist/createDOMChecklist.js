const createBlock = (HTMLAttributes) => {
  const block = document.createElement("div");
  block.className = "block block-checklist";

  Object.entries(HTMLAttributes).forEach((entry) => {
    const key = entry[0];
    const value = entry[1];

    block.setAttribute(key, value);
  });

  return block;
};

const createContent = () => {
  const content = document.createElement("div");
  content.className = "content content-checklist";
  content.setAttribute("data-node-type", "content");

  return content;
};

const createCheckbox = (width, height) => {
  const button = document.createElement("button");
  button.className = "checkbox";
  button.style.width = width + "px";
  button.style.minWidth = width + "px";
  button.style.height = height + "px";
  button.style.minHeight = height + "px";

  return button;
};

const createCheckmark = (width, height) => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("fill", "none");
  svg.setAttribute("class", "checkmark");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M 18 6 L 9 17 L 4 12");
  path.setAttribute("stroke", "currentColor");
  path.setAttribute("stroke-width", "2");
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");

  svg.appendChild(path);

  return svg;
};

const createDOMChecklist = (HTMLAttributes, width, height) => {
  const block = createBlock(HTMLAttributes);
  const content = createContent();
  const checkbox = createCheckbox(width, height);
  const svg = createCheckmark(width, height);
  const listItem = document.createElement("list-item");
  listItem.className = `inline inline-checklist`;

  block.appendChild(content);
  content.appendChild(checkbox);
  checkbox.appendChild(svg);
  content.appendChild(listItem);

  return { block, checkbox, listItem };
};

export default createDOMChecklist;
