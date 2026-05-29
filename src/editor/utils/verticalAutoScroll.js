const verticalAutoScroll = (mouseY) => {
  const MIN_SPEED = 3;
  const MAX_SPEED = 70;
  const THRESHOLD = 30;
  const UPPER_THRESHOLD = THRESHOLD;
  const LOWER_THRESHOLD = window.innerHeight - THRESHOLD;

  if (mouseY <= UPPER_THRESHOLD) {
    const gap = UPPER_THRESHOLD - mouseY;
    const t = gap / MAX_SPEED;
    const speed = Math.min(MIN_SPEED + t * (MAX_SPEED - MIN_SPEED), MAX_SPEED);

    window.scrollBy(0, -speed);
  }

  if (mouseY >= LOWER_THRESHOLD) {
    const gap = mouseY - LOWER_THRESHOLD;
    const t = gap / MAX_SPEED;
    const speed = Math.min(MIN_SPEED + t * (MAX_SPEED - MIN_SPEED), MAX_SPEED);

    window.scrollBy(0, speed);
  }
};

export default verticalAutoScroll;
