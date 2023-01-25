import EventEmitter from 'events';
import nextTick from 'async/nextTick';
import { once, identity } from 'lodash';
import startThread, { sleep } from './start-thread';
import { startPaint } from './map-drawer';
import { getTranslator, rects } from './geom';
import { onElementSize } from './html-helper';
import { PIXEL_PER_METER } from '../map-utils';


const devicePixelRatio = window.devicePixelRatio || 1;


export function updateCanvasSize(canvas) {
	let ret = false;
	const width = canvas.clientWidth * devicePixelRatio;
	const height = canvas.clientHeight * devicePixelRatio;

	if (canvas.width !== width) {
		canvas.width = width;
		ret = true;
	}
	if (canvas.height !== height) {
		canvas.height = height;
		ret = true;
	}
	return ret;
}

export default function Maps() {

	this.showMap = (canvas, map, {scale, centerx, centery, idle, plainDrawing, selected} = {}) => {
		const updateOnce = once(() => update(canvas));

		let coords;
		let uimode;
		const canvasFlag = canvas.showMapFlag = {};
		const events = new EventEmitter();
		const canvasEvents = canvas.events;
		if (!canvas.events) update(canvas);

		const fin = [];
		function detach() {
			fin.reverse().forEach(f => f());
			fin.length = 0;
		}

		const resizer = onElementSize(canvas, canvas => nextTick(() => update(canvas)));
		fin.push(() => resizer.stop());

		events.on('update', () => update(canvas));
		events.on('detach', detach);

		function on(events, event, action) {
			const handler = function () {
				return checkCanvas() && action.apply(this, arguments);
			};
			events.on(event, handler);
			fin.push(() => events.removeListener(event, handler));
		}

		if (canvasEvents && canvasEvents.listenerCount('changed') < 5) {
			on(canvasEvents, 'changed', (data) => {
				coords = data.coords.changeResolution(devicePixelRatio);
				update(data.control);
			});
			on(canvasEvents, 'cs', (newCS) => {
				const mapCenter = {x: newCS.centerX, y: newCS.centerY};
				const canvasCenter = {x: canvas.width / 2, y: canvas.height / 2};
				const dotsPerMeter = canvas.width / (canvas.clientWidth / PIXEL_PER_METER);
				coords = getTranslator(newCS.scale, mapCenter, dotsPerMeter, canvasCenter)
				update(canvas);
			});
			on(canvasEvents, 'pointPicked', (data) => {
				events.emit('pointPicked', data, events.scale);
			});
			on(canvasEvents, 'uimode', (newMode) => { uimode = newMode; });
		}

		events.scale = scale;
		events.centerx = centerx;
		events.centery = centery;

		return events;

		function checkCanvas() {
			if (canvasFlag === canvas.showMapFlag) return true;
			detach();
			return false;
		}

		function update(canvas) {
			startThread(function* () {
				if (!checkCanvas()) return;
				const drawFlag = canvas.showMapFlag.mapDrawCycle = {};
				let count = 0;
				const onCheckExecution = () => {
					if (!checkCanvas()) throw new Error('map drawer is detached');
					if (drawFlag !== canvas.showMapFlag.mapDrawCycle) throw new Error('stop');

					if (++count > (uimode ? 20 : 1000)) {
						count = 0;
						let ret = new Promise(resolve => setTimeout(resolve, 0));
						const i = idle && idle();
						if (i) ret = Promise.all([ret, i]);
						return ret;
					}
				};
				events.emit('update.begin', canvas, map);

				const c = onCheckExecution();
				c && (yield c);
				updateCanvasSize(canvas);
				if (!coords) {
					let dotsPerMeter = canvas.width / (canvas.clientWidth / PIXEL_PER_METER);
					if (isNaN(dotsPerMeter)) dotsPerMeter = 3780;

					if (centerx == null) {
						const bounds = rects.middleRect(...map.layers.map(layer => layer.bounds));
						if (!bounds) {
							if (!scale) scale = 5000;
							centerx = 0;
							centery = 0;
						} else {
							if (!scale) {
								scale = 1.05 * Math.max(
									(bounds.max.x - bounds.min.x) / (canvas.width / dotsPerMeter),
									(bounds.max.y - bounds.min.y) / (canvas.height / dotsPerMeter)
								);
							}
							centerx = (bounds.min.x + bounds.max.x) / 2;
							centery = (bounds.min.y + bounds.max.y) / 2;
						}
					}

					coords = getTranslator(scale, {x: centerx, y: centery}, dotsPerMeter, {
						x: canvas.width / 2,
						y: canvas.height / 2
					});
				}

				const p = coords.pointToMap({x: canvas.width / 2, y: canvas.height / 2});
				events.scale = coords.mscale;
				events.centerx = p.x;
				events.centery = p.y;

				canvasEvents && canvasEvents.emit('init', coords.changeResolution(1 / devicePixelRatio));

				const onDataWaiting = (plainDrawing || map.mapErrors.length > 0)
					? identity
					: (promise) => promise.then(updateOnce);

				const context = canvas.getContext ? canvas.getContext('2d') : canvas;
				context.fillStyle = 'white';
				context.fillRect(0, 0, canvas.width, canvas.height, 'white');

				const _startPaint = (draftDrawing) => startPaint(canvas, map, {
					events, selected, onDataWaiting, onCheckExecution,
					coords, pixelRatio: devicePixelRatio, draftDrawing,
				});

				if (uimode) {
					yield _startPaint(true);
					yield sleep(400);
				}

				yield _startPaint(false);
				events.emit('update.end', canvas);
			}).catch();
		}
	};
};
