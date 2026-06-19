// get rect of window
// -> document.documentElement.getBoundingClientRect();
const autoScroll = (
  mouseCoord,
  container,
  containerRect,
  dir = "horizontal", // vertical || horizontal
  threshold = 30,
) => {
  const containerCoord =
    dir === "horizontal" ? containerRect.x : containerRect.y;
  const containerLength =
    dir === "horizontal" ? containerRect.width : containerRect.height;

  const MIN_SPEED = 3;
  const MAX_SPEED = 70;
  const THRESHOLD = threshold;
  const A_THRESHOLD = containerCoord + THRESHOLD;
  const B_THRESHOLD = containerCoord + containerLength - THRESHOLD;

  if (mouseCoord <= A_THRESHOLD) {
    const gap = A_THRESHOLD - mouseCoord;
    const t = gap / MAX_SPEED;
    const speed = Math.min(MIN_SPEED + t * (MAX_SPEED - MIN_SPEED), MAX_SPEED);

    dir === "horizontal"
      ? container.scrollBy(-speed, 0)
      : container.scrollBy(0, -speed);
  }

  if (mouseCoord >= B_THRESHOLD) {
    const gap = mouseCoord - B_THRESHOLD;
    const t = gap / MAX_SPEED;
    const speed = Math.min(MIN_SPEED + t * (MAX_SPEED - MIN_SPEED), MAX_SPEED);

    dir === "horizontal"
      ? container.scrollBy(speed, 0)
      : container.scrollBy(0, speed);
  }
};

export default autoScroll;
