import EventEmitter from 'events';
import { startPaint } from './map-drawer';
import { getTranslator, rects } from './geom';
import { onElementSize } from './html-helper';
import { PIXEL_PER_METER } from '../lib/map-utils';


/**
 * @param canvas {MapCanvas}
 * @param map {MapData}
 * @param viewport {MapViewport}
 * */
export function showMap(canvas, map, viewport) {
  let { centerX, centerY, scale } = viewport;

  let coords;
  let uiMode;
  const canvasFlag = canvas.showMapFlag = {};
  const events = new EventEmitter();
  const canvasEvents = canvas.events;
  if (!canvas.events) update(canvas);

  const fin = [onElementSize(canvas, update)];
  function detach() {
    fin.reverse().forEach(f => f());
    fin.length = 0;
  }

  events.on('update', () => update(canvas));
  events.on('detach', detach);

  if (canvasEvents && canvasEvents.listenerCount('changed') < 5) {
    function on(event, action) {
      const handler = function () {
        return checkCanvas() && action.apply(this, arguments);
      };
      canvasEvents.on(event, handler);
      fin.push(() => canvasEvents.removeListener(event, handler));
    }

    on('changed', (data) => {
      coords = data.coords.changeResolution(window.devicePixelRatio);
      update(data.control);
    });
    on('cs', (newCS) => {
      const mapCenter = {x: newCS.centerX, y: newCS.centerY};
      const canvasCenter = {x: canvas.width / 2, y: canvas.height / 2};
      const dotsPerMeter = canvas.width / (canvas.clientWidth / PIXEL_PER_METER);
      coords = getTranslator(newCS.scale, mapCenter, dotsPerMeter, canvasCenter)
      update(canvas);
    });
    on('pointPicked', (data) => {
      events.emit('pointPicked', data, events.scale);
    });
    on('uimode', (newMode) => { uiMode = newMode; });
  }

  events.scale = scale;
  events.centerx = centerX;
  events.centery = centerY;

  return events;

  function checkCanvas() {
    if (canvasFlag === canvas.showMapFlag) return true;
    detach();
    return false;
  }

  async function update(canvas) {
    if (!checkCanvas()) return;
    const drawFlag = canvas.showMapFlag.mapDrawCycle = {};
    let count = 0;

    const onCheckExecution = () => {
      if (!checkCanvas()) throw new Error('map drawer is detached');
      if (drawFlag !== canvas.showMapFlag.mapDrawCycle) throw new Error('stop');

      if (++count > (uiMode ? 20 : 1000)) {
        count = 0;
        return new Promise(resolve => setTimeout(resolve, 0));
      }
    };

    const c = onCheckExecution();
    c && (await c);

    const width = canvas.clientWidth * window.devicePixelRatio;
    const height = canvas.clientHeight * window.devicePixelRatio;
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;

    if (!coords) {
      let dotsPerMeter = width / (canvas.clientWidth / PIXEL_PER_METER);
      if (isNaN(dotsPerMeter)) dotsPerMeter = 3780;

      if (centerX == null) {
        const bounds = rects.middleRect(...map.layers.map(layer => layer.bounds));
        if (!bounds) {
          if (!scale) scale = 5000;
          centerX = 0;
          centerY = 0;
        } else {
          if (!scale) {
            scale = 1.05 * Math.max(
              (bounds.max.x - bounds.min.x) / (width / dotsPerMeter),
              (bounds.max.y - bounds.min.y) / (height / dotsPerMeter)
            );
          }
          centerX = (bounds.min.x + bounds.max.x) / 2;
          centerY = (bounds.min.y + bounds.max.y) / 2;
        }
      }

      coords = getTranslator(scale, {x: centerX, y: centerY}, dotsPerMeter, {
        x: width / 2,
        y: height / 2
      });
    }

    const p = coords.pointToMap({x: width / 2, y: height / 2});
    events.scale = coords.mscale;
    events.centerx = p.x;
    events.centery = p.y;

    canvasEvents && canvasEvents.emit('init', coords.changeResolution(1 / window.devicePixelRatio));

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    const startPaintFn = (draftDrawing) => startPaint(canvas, map, {
      events, onCheckExecution, coords,
      pixelRatio: window.devicePixelRatio, draftDrawing,
    });

    if (uiMode) {
      await startPaintFn(true);
      // sleep for 400ms
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
    await startPaintFn(false);
  }
}
