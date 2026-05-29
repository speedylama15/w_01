// fix: add more
const atoms = {
  divider: true,
  image: true,
  audio: true,
  video: true,
};

const getPosAtDOM = (view, dom) => {
  const pos = view.posAtDOM(dom);

  const contentType = dom.dataset.contentType;

  if (atoms[contentType]) return pos;

  return pos - 1;
};

export default getPosAtDOM;
