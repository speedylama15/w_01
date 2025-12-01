const createBlock = (HTMLAttributes) => {
  const block = document.createElement("div");
  block.className = "block block-checklist";
  block.setAttribute("data-id", HTMLAttributes["data-id"]);
  block.setAttribute("data-node-type", HTMLAttributes["data-node-type"]);
  block.setAttribute("data-is-checked", HTMLAttributes["data-is-checked"]);
  block.setAttribute("data-content-type", HTMLAttributes["data-content-type"]);
  block.setAttribute("data-indent-level", HTMLAttributes["data-indent-level"]);

  return block;
};

const createCheckmark = () => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("class", "checkmark");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M20 6L9 17L4 12");
  path.setAttribute("stroke", "currentColor");
  path.setAttribute("stroke-width", "2");
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");

  svg.appendChild(path);

  return svg;
};

const createContent = () => {
  const content = document.createElement("div");
  content.className = "content content-checklist";
  content.setAttribute("data-node-type", "content");

  return content;
};

const createCheckbox = () => {
  const button = document.createElement("button");
  button.className = "checkbox";

  return button;
};

const createDOMChecklist = (HTMLAttributes, editor, view, node, getPos) => {
  const { dispatch } = view;

  const block = createBlock(HTMLAttributes);
  const content = createContent();
  const checkbox = createCheckbox();
  const svg = createCheckmark();
  const listItem = document.createElement("list-item");

  block.appendChild(content);
  content.appendChild(checkbox);
  content.appendChild(listItem);
  checkbox.appendChild(svg);

  // FIX: remove event listener
  checkbox.addEventListener("mousedown", () => {
    const { state } = editor;
    const { tr } = state;

    const isChecked = JSON.parse(node.attrs?.isChecked);

    tr.setNodeAttribute(getPos(), "isChecked", !isChecked);

    dispatch(tr);
  });

  return { block, checkbox, listItem };
};

export default createDOMChecklist;
