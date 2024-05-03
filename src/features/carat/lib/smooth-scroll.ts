import { CaratStage } from '../rendering/stage';
import { CaratTrack } from '../rendering/track';


/** Плавно переместит вьюпорт трека.
 * @param stage сцена диаграммы
 * @param index индекс изменяемеого трека, если -1, то все
 * @param direction в какую сторону
 * */
export function moveSmoothly(stage: CaratStage, index: number, direction: 1 | -1) {
  const frameTime = 16; // 60 FPS => 1000ms / 60

  if (index === -1) {
    stage.trackList.forEach((track, i) => {
      const scroll = track.viewport.scroll;
      fillQueue(track, direction, frameTime);

      if (scroll.id === null) {
        scroll.id = window.setInterval(moveView, frameTime, stage, track.viewport, i);
      }
    });
  } else {
    const track = stage.trackList[index];
    const scroll = track.viewport.scroll;
    fillQueue(track, direction, frameTime);

    if (scroll.id === null) {
      scroll.id = window.setInterval(moveView, frameTime, stage, track.viewport, index);
    }
  }
}

function fillQueue(track: CaratTrack, direction: 1 | -1, frameTime: number) {
  const duration = 250; // 0.25 second
  const scroll = track.viewport.scroll;

  if (scroll.direction !== direction) {
    scroll.direction = direction;
    scroll.queue = [];
  }

  const by = direction * scroll.step;
  const queue = scroll.queue;
  let time = 0, prevY = 0, step = 0;

  while (time < duration) {
    const currentY = by * cubicBezierEaseInOut(time / duration);
    const delta = currentY - prevY;

    if (queue[step] === undefined) {
      queue.push(delta);
    } else {
      queue[step] += delta;
    }

    step += 1;
    prevY = currentY;
    time += frameTime;
  }
}

/** Аналог CSS timing function `ease-in-out`. */
function cubicBezierEaseInOut(t): number {
  return t * t * (3 - 2 * t);
}

function moveView(stage: CaratStage, viewport: CaratViewport, i: number) {
  const scroll = viewport.scroll;

  if (scroll.queue.length === 0) {
    clearInterval(scroll.id);
    return scroll.id = null;
  }

  let newY = viewport.y + scroll.queue.shift();

  if (newY + viewport.height > viewport.max) {
    newY = viewport.max - viewport.height;
  } else if (newY < viewport.min) {
    newY = viewport.min;
  }
  if (viewport.y !== newY) {
    viewport.y = newY;
    stage.lazyRender(i);
  }
}
