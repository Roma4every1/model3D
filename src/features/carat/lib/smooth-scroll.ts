/** Плавно переместит порт просмотра.
 * @param viewport порт просмотра
 * @param drawer отрисовищк
 * @param by на сколько переместить
 * */
export function moveSmoothly(viewport: CaratViewport, drawer: ICaratDrawer, by: number) {
  const duration = 250; // 0.25 second
  const frameTime = 16; // 60 FPS => 1000ms / 60

  let time = 0;
  let startY = viewport.y;
  let lastY = viewport.y;

  const id = setInterval(() => {
    let newY = startY + by * cubicBezierEaseInOut(time / duration);
    viewport.y += newY - lastY;
    drawer.render();
    lastY = newY;
    if (time >= duration) clearInterval(id);
    time += frameTime;
  }, frameTime);
}

/** Аналог CSS timing function `ease-in-out`. */
function cubicBezierEaseInOut(t) {
  return t * t * (3 - 2 * t);
}
