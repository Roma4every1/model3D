import { startPaint } from './map-drawer';
import { getTranslator  } from './geom';
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
  const canvasEvents = canvas.events;

  const onChanged = (data) => {
    if (!checkCanvas()) return;
    coords = data.coords.changeResolution(window.devicePixelRatio);
    update(data.control);
  };
  const onCS = (newCS) => {
    if (!checkCanvas()) return;
    const mapCenter = {x: newCS.centerX, y: newCS.centerY};
    const canvasCenter = {x: canvas.width / 2, y: canvas.height / 2};
    const dotsPerMeter = canvas.width / (canvas.clientWidth / PIXEL_PER_METER);
    coords = getTranslator(newCS.scale, mapCenter, dotsPerMeter, canvasCenter)
    update(canvas);
  };
  const onUiMode = (newMode) => {
    if (!checkCanvas()) return;
    uiMode = newMode;
  };

  canvasEvents.on('changed', onChanged);
  canvasEvents.on('cs', onCS);
  canvasEvents.on('uimode', onUiMode);

  function detach() {
    canvasEvents.removeListener('changed', onChanged);
    canvasEvents.removeListener('cs', onCS);
    canvasEvents.removeListener('uimode', onUiMode);
  }

  update(canvas);
  return {update, detach};

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

      const mapCenter = {x: centerX, y: centerY};
      const canvasCenter = {x: width / 2, y: height / 2};
      coords = getTranslator(scale, mapCenter, dotsPerMeter, canvasCenter);
    }

    const point = coords.pointToMap({x: width / 2, y: height / 2});
    canvasEvents.emit('init', coords.changeResolution(1 / window.devicePixelRatio));

    const ctx = canvas.getContext('2d');
    const options = {onCheckExecution, coords, point, ctx, draftDrawing: true};
    ctx.clearRect(0, 0, width, height);

    if (uiMode) {
      await startPaint(canvas, map, options);
      // sleep for 400ms
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    options.draftDrawing = false;
    await startPaint(canvas, map, options);
  }
}
