const isLeftClick = (e) => {
  return (
    e.button === 0 && // Left button
    !e.ctrlKey && // No Control key
    !e.shiftKey && // No Shift key
    !e.altKey && // No Alt key
    !e.metaKey // No Command (Mac) or Windows key
  );
};

export default isLeftClick;
