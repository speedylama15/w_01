const isRangeInRange = (inner, outer) => {
  return inner.start >= outer.start && inner.end <= outer.end;
};

export default isRangeInRange;
