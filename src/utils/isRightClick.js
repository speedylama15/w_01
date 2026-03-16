const isRightClick = (e) => {
  return e.button === 2 && !e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey;
};

export default isRightClick;
