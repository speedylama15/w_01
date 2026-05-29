const isPureLeftClick = (e) => {
  return (
    e.button === 0 &&
    e.buttons === 1 &&
    !e.ctrlKey &&
    !e.shiftKey &&
    !e.altKey &&
    !e.metaKey
  );
};

export default isPureLeftClick;
