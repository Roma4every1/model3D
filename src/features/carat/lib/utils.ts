/** Плавно переместит порт просмотра.
 * @param viewport порт просмотра
 * @param stage экземпляр сцены
 * @param by на сколько переместить
 * */
export function moveSmoothly(viewport: CaratViewport, stage: ICaratStage, by: number) {
  const duration = 250; // 0.25 second
  const frameTime = 16; // 60 FPS => 1000ms / 60

  let time = 0;
  let startY = viewport.y;
  let lastY = viewport.y;

  const id = setInterval(() => {
    let newY = startY + by * cubicBezierEaseInOut(time / duration);
    viewport.y += newY - lastY;
    stage.render();
    lastY = newY;
    if (time >= duration) clearInterval(id);
    time += frameTime;
  }, frameTime);
}

/** Аналог CSS timing function `ease-in-out`. */
function cubicBezierEaseInOut(t) {
  return t * t * (3 - 2 * t);
}

/* --- Geometry --- */

/** Находится ли точка внутри ограничивающего прямоугольника. */
export function isRectInnerPoint(x: number, y: number, rect: BoundingRect) {
  return x >= rect.left && x <= rect.right && y >= rect.bottom && y <= rect.top;
}
