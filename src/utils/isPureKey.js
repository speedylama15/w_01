function isPureKey(e, key) {
  return (
    e.key === key &&
    !e.metaKey &&
    !e.ctrlKey &&
    !e.altKey &&
    !e.shiftKey &&
    !e.getModifierState("Fn") &&
    !e.getModifierState("Hyper") &&
    !e.getModifierState("Super") &&
    !e.getModifierState("OS") &&
    !e.getModifierState("Win") &&
    !e.getModifierState("CapsLock")
  );
}

export default isPureKey;
