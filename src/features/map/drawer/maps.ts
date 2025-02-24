import type { Translator } from './translator';
import type { MapExtraObjectState } from '../extra-objects/types';
import { startPaint } from './map-drawer';
import { getTranslator } from './translator';


export function showMap(
  ctx: CanvasRenderingContext2D, map: MapData, viewport: MapViewport,
  extra?: Map<MapExtraObjectID, MapExtraObjectState>,
) {
  const { cx, cy, scale } = viewport;
  let coords: Translator;
  let uiMode: boolean;
  const canvas = ctx.canvas as MapCanvas;
  const canvasFlag = canvas.showMapFlag = {};
  const canvasEvents = canvas.events;

  const onChanged = (data: Translator = coords) => {
    if (changeCanvas()) return;
    coords = data;
    update(canvas);
  };
  const onCS = (newCS: MapViewport) => {
    if (changeCanvas()) return;
    const mapCenter = {x: newCS.cx, y: newCS.cy};
    const canvasCenter = {x: canvas.width / 2, y: canvas.height / 2};
    coords = getTranslator(newCS.scale, mapCenter, canvasCenter)
    update(canvas);
  };
  const onMode = (newMode: boolean) => {
    if (changeCanvas()) return;
    uiMode = newMode;
  };

  canvasEvents.on('changed', onChanged);
  canvasEvents.on('cs', onCS);
  canvasEvents.on('mode', onMode);

  function detach() {
    canvasEvents.removeListener('changed', onChanged);
    canvasEvents.removeListener('cs', onCS);
    canvasEvents.removeListener('mode', onMode);
  }

  update(canvas);
  return detach;

  function changeCanvas() {
    if (canvasFlag === canvas.showMapFlag) return false;
    detach();
    return true;
  }

  async function update(canvas: MapCanvas) {
    if (changeCanvas()) return;
    const drawFlag = canvas.showMapFlag.mapDrawCycle = {};
    let count = 0;

    const onCheckExecution = (): void | Promise<void> => {
      if (changeCanvas()) throw new Error('map drawer is detached');
      if (drawFlag !== canvas.showMapFlag.mapDrawCycle) throw new Error('stop');

      if (++count > (uiMode ? 20 : 1000)) {
        count = 0;
        return new Promise(resolve => setTimeout(resolve, 0));
      }
    };

    const c = onCheckExecution();
    if (c) await c;

    const width = canvas.clientWidth * window.devicePixelRatio;
    const height = canvas.clientHeight * window.devicePixelRatio;
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;

    if (!coords) {
      const mapCenter = {x: cx, y: cy};
      const canvasCenter = {x: width / 2, y: height / 2};
      coords = getTranslator(scale, mapCenter, canvasCenter);
    }

    const point = coords.pointToMap({x: width / 2, y: height / 2});
    canvasEvents.emit('init', coords);

    const options = {onCheckExecution, coords, point, ctx, draftDrawing: true, extra};
    ctx.clearRect(0, 0, width, height);

    if (uiMode) {
      await startPaint(map, options);
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    options.draftDrawing = false;
    await startPaint(map, options);
  }
}
