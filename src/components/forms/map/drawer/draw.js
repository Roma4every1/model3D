import { onElementSize } from './html-helper';
import { startPaint } from './map-drawer';
import { rects } from './geom';
import { PIXEL_PER_METER } from '../map-utils';


const devicePixelRatio = window.devicePixelRatio || 1;

function updateCanvasSize(canvas) {
	canvas.width = canvas.clientWidth * devicePixelRatio || 0
	canvas.height = canvas.clientHeight * devicePixelRatio || 0
}

const RESOLVED = Promise.resolve();

export function showMap(canvas, map, { scale, centerx, centery, idle } = {}) {
	gard.flag = canvas.mapDrawCycle = {}
	function gard() {
		if (gard.flag !== canvas.mapDrawCycle) throw new Error("stop")
		if (idle) idle()
		return RESOLVED
	}
	onElementSize(canvas, canvas => {
		gard();
		updateCanvasSize(canvas);

		const dotsPerMeter = canvas.width / (canvas.clientWidth / PIXEL_PER_METER);

		if (centerx == null) {
			const bounds = rects.join(...map.layers.map(layer => layer.bounds));
			if (!bounds) {
				if (!scale) scale = 5000
				centerx = 0
				centery = 0
			}
			else {
				if (!scale)
					scale = 1.05 * Math.max(
						(bounds.max.x - bounds.min.x) / (canvas.width / dotsPerMeter),
						(bounds.max.y - bounds.min.y) / (canvas.height / dotsPerMeter)
					)
				centerx = (bounds.min.x + bounds.max.x) / 2
				centery = (bounds.min.y + bounds.max.y) / 2
			}
		}

		const ctx = canvas.getContext('2d');
		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, canvas.width, canvas.height, "white")

		startPaint(canvas, map, {
			dotsPerMeter, pixelRatio: devicePixelRatio,
			scale, centerx, centery,
			onIdle: gard,
		}).catch()
	});
}

window.Drawer = module.exports;
