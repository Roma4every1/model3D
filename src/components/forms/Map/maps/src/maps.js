import {once, identity} from "lodash";
import logger from "./logger";
import startThread, {sleep} from "./startThread";
import {types, startPaint as _startPaint} from "./mapDrawer";
import {translator, rects} from "./geom";
import {onElementSize} from "./htmlHelper";
import pixelPerMeter from "./pixelPerMeter";
import EventEmitter from "events";
import nextTick from 'async/nextTick';


const devicePixelRatio = window.devicePixelRatio || 1;


function updateCanvasSize(canvas) {
	let ret = false;
	const width = canvas.clientWidth * devicePixelRatio || 0;
	const height = canvas.clientHeight * devicePixelRatio || 0;

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

export default function Maps(provider) {
	this.checkIndex = (ret, context) => startThread(function* updateMapThread() {
		logger.info('checking indexes for all layers map', ret);
		const mapDataEvents = yield [];
		for (let layer of ret.layers) {
			mapDataEvents.push(layer.elementsData = startThread(function* () {
				let elements = [];
				// load container from index
				let indexName = null;
				if (ret.indexes) {
					const indexesForContainer = ret.indexes.find(function (i) {
						return i.container === layer.container
					});
					const indexes = [];
					if (indexesForContainer && context && context.center) {
						indexesForContainer.data.forEach((idx) => {
							if (idx.maxx >= context.center.x && idx.minx < context.center.x && idx.maxy >= context.center.y && idx.miny < context.center.y) {
								indexes.push(idx)
							}
						});
						let scaleDif = 0;
						indexes.forEach((idx) => {
							const diff = idx.scale - context.scale + 1;
							if (scaleDif <= 0 || (diff < scaleDif && diff > 0)) {
								scaleDif = diff
								indexName = idx.hash
							}
						});
					}
				}

				try {
					if (indexName && indexName !== layer.index) {
						logger.warn(`index updated from ${layer.index} to ${indexName} for container ${layer.container} layer ${layer.uid}`);
						layer.index = indexName;
					}

					const data = yield provider.getContainer(layer.container, indexName || layer.index);
					const layerFromContainer = layer.uid.includes(layer.container)
						? data.layers[layer.uid.replace(layer.container, '')]
						: data.layers[layer.uid];

					elements = layerFromContainer.elements;
					layer.version = layerFromContainer.version;

					if (elements.length === 0) {
						// try to find elements among of [layername] layer into container
						const nameFromContainerInBrackets = '[' + layerFromContainer.name + ']';
						const newLayer = Object.values(data.layers).find(function (l) {
							return l.name === nameFromContainerInBrackets
						});
						if (newLayer != null) elements = newLayer.elements;
					}

					for (var i of elements) {
						var t = types[i.type];
						if (t && t.loaded) {
							var r = t.loaded(i, provider);
							if (r) mapDataEvents.push(r);
						}
					}
					layer.elements = elements;
				} catch (error) {
					ret.mapErrors.push(error);
					logger.error("error", error);
				}
				return elements;
			}))
		}

		ret.mapData = startThread(function* () {
			while (mapDataEvents.length)
				try {
					yield mapDataEvents.pop();
				} catch (error) {
					ret.mapErrors.push(error);
					logger.error('error', error);
				}
		});
		logger.info('updated map', ret);
	})


	this.loadMap = (map, context) => startThread(function* loadMapThread() {
		logger.info('loading map', map);
		if (typeof map != 'string') map = map.ID;

		const mapDataEvents = [];
		const ret = yield provider.getMap(map);
		ret.mapErrors = [];

		mapDataEvents.push(ret.pointsData = startThread(function* () {
			try {
				const data = yield provider.getContainer(ret.namedpoints);
				return ret.points = data.namedpoints;
			} catch (error) {
				const message = 'error loading named points from ';
				ret.mapErrors.push(message + ret.namedpointsContainer + ', ' + error);
				logger.error(message, ret.namedpointsContainer, error);
				return [];
			}
		}));

		for (let layer of ret.layers) {
			layer.elements = null;

			mapDataEvents.push(layer.elementsData = startThread(function* () {
				let elements = [];
				try {
					// load container from index
					let indexName = null;
					if (ret.indexes) {
						const indexes = [];
						const indexesForContainer = ret.indexes.find((i) => i.container === layer.container);

						if (indexesForContainer && context && context.center) {
							indexesForContainer.data.forEach((idx) => {
								if (
									idx.maxx >= context.center.x &&
									idx.minx < context.center.x &&
									idx.maxy >= context.center.y &&
									idx.miny < context.center.y
								) indexes.push(idx)
							});

							let scaleDif = 0;
							indexes.forEach((idx) => {
								const diff = idx.scale - context.scale + 1;
								if (scaleDif <= 0 || (diff < scaleDif && diff > 0)) {
									scaleDif = diff
									indexName = idx.hash
								}
							});

							if (!indexName) {
								logger.warn('froblem with index calculation found index for container ' + layer.container);
								if (indexesForContainer.data.length > 0) indexName = indexesForContainer.data[0].hash;
							}
						}

						if (indexName) {
							logger.info(`found index ${indexName} for container ${layer.container}`);
							layer.index = indexName;
						}
					}

					const data = yield provider.getContainer(layer.container, indexName);
					const layerFromContainer = layer.uid.includes(layer.container)
						? data.layers[layer.uid.replace(layer.container, '')]
						: data.layers[layer.uid];

					elements = layerFromContainer.elements;
					layer.version = layerFromContainer.version;

					if (elements.length === 0) {
						// try to find elements among of [layername] layer into container
						const nameFromContainerInBrackets = "[" + layerFromContainer.name + "]";
						const newLayer = Object.values(data.layers).find(function (l) {
							return l.name === nameFromContainerInBrackets
						});
						if (newLayer != null) {
							elements = newLayer.elements;
						}
					}

					for (let i of elements) {
						const t = types[i.type];
						if (t && t.loaded) {
							const r = t.loaded(i, provider);
							if (r) mapDataEvents.push(r);
						}
					}
				} finally {
					layer.elements = elements;
				}
				return elements;
			}));
		}

		// DO NOT USE 'Promise.all( mapDataEvents )' because mapDataEvents is being changed during waiting!
		ret.mapData = startThread(function* () {
			while (mapDataEvents.length)
				try {
					yield mapDataEvents.pop();
				} catch (error) {
					ret.mapErrors.push(error);
					logger.error('error', error, 'loading map', map);
				}
		});

		logger.info('loaded map', map, ret);
		return ret;
	});

	this.loadProfile = () => startThread(function* loadMapThread() {
		let ret = yield provider.getProfile("profile");
		const container = JSON.parse(ret.profileInnerContainer);
		ret = ret.mi;
		ret.pointsData = [];
		ret.mapErrors = [];
		ret.date = "2014-09-01"; //check whether we do really need all this stuff
		ret.etag = "2766A0B8";
		ret.mapcode = "LIT";
		ret.mapname = "Карта разработки";
		ret.objectcode = "001";
		ret.objectname = "Усинское";
		ret.organization = "DBMM$1";
		ret.plastcode = "606";
		ret.plastname = "Верхний";
		ret.type = "profile"; //allows not to wait for wells data (available for maps only)

		const mapDataEvents = [];
		for (let layer of ret.layers) {
			layer.elements = null;
			if (layer.highscale === 0) layer.highscale = 1000000000;

			mapDataEvents.push(layer.elementsData = startThread(function* () {
				let elements = yield [];
				try {
					const data = container;
					elements = layer.uid.includes(layer.container) ? data.layers[layer.uid.replace(layer.container, '')].elements : data.layers[layer.uid].elements;
					for (let i of elements) {
						const t = types[i.type];
						if (t && t.loaded) {
							const r = t.loaded(i, provider);
							if (r) mapDataEvents.push(r);
						}
					}
				} finally {
					layer.elements = elements;
				}
				return elements;
			}));
		}

		// DO NOT USE 'Promise.all( mapDataEvents )' because mapDataEvents is being changed during waiting!
		ret.mapData = startThread(function* () {
			while (mapDataEvents.length)
				try {
					yield mapDataEvents.pop();
				} catch (error) {
					ret.mapErrors.push(error);
					logger.error("error", error, "loading profile");
				}
		});

		logger.info("loaded map", ret);
		return ret;
	});

	this.drawTrack = (canvas, scale, centerx, centery, track) => {
		if (scale == null || centerx == null || centery == null) {
			logger.warn("drawTrack[maps.js:124]: scale || centerx || centery is null. ");
			return;
		}
		if (track.length < 1) {
			return;
		}
		var context = canvas.getContext("2d");
		var dotsPerMeter = canvas.width / (canvas.clientWidth / pixelPerMeter());
		var coords = translator(scale, {x: centerx, y: centery}, dotsPerMeter, {x: canvas.width / 2, y: canvas.height / 2});
		var translatedTrack = [];
		context.lineWidth = 0.75 * 0.001 * dotsPerMeter;

		for (let i = 0; i < track.length; i++) {
			translatedTrack.push(coords.pointToControl(track[i]));
		}

		context.strokeStyle = "#4400FF";
		for (let i = 0; i < translatedTrack.length - 1; i++) {
			context.beginPath();
			context.moveTo(translatedTrack[i].x, translatedTrack[i].y);
			context.lineTo(translatedTrack[i + 1].x, translatedTrack[i + 1].y);
			context.stroke();
		}
	};

	this.drawContour = (canvas, map, scale, centerx, centery, contour, closeContour) => {
		let ctx = canvas.getContext("2d");
		let dotsPerMeter = canvas.width / (canvas.clientWidth / pixelPerMeter());
		let coords = translator(scale, {x: centerx, y: centery}, dotsPerMeter, {x: canvas.width / 2, y: canvas.height / 2});
		let contourLength = contour.length;

		ctx.strokeStyle = "#FF0000";
		ctx.lineWidth = 3;
		ctx.beginPath();
		let startPoint = coords.pointToControl(contour[0]);
		ctx.moveTo(startPoint.x, startPoint.y);
		for (let i = 1; i < contourLength; i++) {
			let currPoint = coords.pointToControl(contour[i]);
			ctx.lineTo(currPoint.x, currPoint.y);
			if (i === contourLength - 1) {
				if (closeContour) {
					ctx.lineTo(startPoint.x, startPoint.y);
				} else {
					ctx.save();
					ctx.strokeStyle = "#FF0000";
					ctx.lineWidth = 4;
					ctx.arc(currPoint.x, currPoint.y, 2, 0, 2 * Math.PI);
					ctx.restore();
				}
			}
		}

		ctx.stroke();
		// ctx.closePath();
	};

	this.getStocksWithinContour = (canvas, map, scale, centerx, centery, contour, contourOptions) => {

		let dotsPerMeter = canvas.width / (canvas.clientWidth / pixelPerMeter());
		let coords = translator(scale, {x: centerx, y: centery}, dotsPerMeter, {x: canvas.width / 2, y: canvas.height / 2});

		//we have to draw contour to make sure that we are using required contour while using ctx.isPointInPath()
		// this.drawContour(canvas, map, scale, centerx, centery, contour, true);
		let fieldStocks;
		let fieldLayer = map.layers.find(l => l.elements.some(e => e.type === "field"));
		if (fieldLayer) {
			fieldStocks = types["field"].getStocksWithinContour(
				fieldLayer.elements[0],
				{
					canvas,
					coords,
					contour,
					contourOptions,
					contourBuildRequired: true
				}
			);
			return fieldStocks;
		}
		return 0;
	};

	this.getStocksWithinDrenageArea = (canvas, map, scale, centerx, centery, drenageArea) => {
		let context = canvas.getContext("2d");
		let dotsPerMeter = canvas.width / (canvas.clientWidth / pixelPerMeter());
		let areaDrawer = types[drenageArea.type];
		let coords = translator(scale, {x: centerx, y: centery}, dotsPerMeter, {x: canvas.width / 2, y: canvas.height / 2});

		// draw invisible contour to calculate stocks
		context.save();
		context.strokeStyle = "rgba(255,255,255,0.0)";
		areaDrawer.path(drenageArea, {
			context,
			pointToControl: coords.pointToControl
		});
		context.stroke();
		context.restore();

		let fieldLayer = map.layers.find(l => l.elements.some(e => e.type === "field"));
		let fieldStocks = 0;
		if (fieldLayer) {
			fieldStocks = types["field"].getStocksWithinContour(fieldLayer.elements[0], {canvas, coords});
		}
		return fieldStocks;
	};

	this.getDrenageAreaByWellId = (wellId, map, targetLayerOptions) => {
		let drenageAreaLayers = map.layers.filter(l => l.name.toLowerCase().includes(targetLayerOptions.partOfLayerName));
		if (drenageAreaLayers.length !== 1) {
			logger.warn(`Attempting to find layer with '${targetLayerOptions.partOfLayerName}' string included in name. Found: ${drenageAreaLayers.length}. Null returned`);
			return null;
		}
		let drenageAreaLayer = drenageAreaLayers[0];
		if (Array.isArray(drenageAreaLayer.elements)) {
			return drenageAreaLayer.elements.find((element) => {
				return element.uwid === wellId;
			});
		} else {
			return null;
		}
	};

	this.getDrenageAreaByPoint = (canvas, map, scale, centerx, centery, point, targetLayerOptions) => {
		let ctx = canvas.getContext("2d");
		let dotsPerMeter = canvas.width / (canvas.clientWidth / pixelPerMeter());
		let coords = translator(scale, {x: centerx, y: centery}, dotsPerMeter, {x: canvas.width / 2, y: canvas.height / 2});
		let translatedPoint = coords.pointToControl(point);

		let drenageAreaLayers = map.layers.filter(l => l.name.toLowerCase().includes(targetLayerOptions.partOfLayerName));
		if (drenageAreaLayers.length !== 1) {
			logger.warn(`Attempting to find layer with '${targetLayerOptions.partOfLayerName}' string included in name. Found: ${drenageAreaLayers.length}. Null returned`);
			return null;
		}
		let drenageAreaLayer = drenageAreaLayers[0];
		drenageAreaLayer.visible = true;

		// reduce the amount of areas we have to check by comparing bounds with given point
		let targetAreas = drenageAreaLayer.elements.filter(element => {
			return (element.bounds.min.x < point.x &&
				element.bounds.max.x > point.x &&
				element.bounds.min.y < point.y &&
				element.bounds.max.y > point.y);
		});

		let targetArea = null;
		targetAreas.forEach((area) => {
			//draw invisible line along each found zone contour to check whether target point
			let polylineType = types[area.type];
			ctx.save();
			ctx.strokeStyle = area.bordercolor;
			ctx.lineWidth = 0;
			polylineType.path(area, {
				context: ctx,
				pointToControl: coords.pointToControl
			});
			ctx.stroke();
			if (ctx.isPointInPath(translatedPoint.x, translatedPoint.y)) {
				targetArea = area;
			}
			ctx.restore();
		});

		if (targetArea) {
			ctx.save();
			ctx.strokeStyle = targetLayerOptions.selection.bordercolor;
			ctx.lineWidth = targetLayerOptions.selection.linewidth;
			let polylineType = types[targetArea.type];
			polylineType.path(targetArea, {
				context: ctx,
				pointToControl: coords.pointToControl
			});
			ctx.stroke();
			ctx.restore();
		}

		return targetArea;
	};

	this.getFieldValueInPoint = (canvas, map, scale, centerx, centery, point) => {
		let dotsPerMeter = canvas.width / (canvas.clientWidth / pixelPerMeter());
		let coords = translator(scale, {x: centerx, y: centery}, dotsPerMeter, {x: canvas.width / 2, y: canvas.height / 2});

		let fieldValue = null;
		let fieldName;
		let fieldLayer = map.layers.find(l => l.elements.some(e => e.type === "field"));
		if (fieldLayer) {
			fieldName = fieldLayer.name;
			fieldValue = types["field"].getFieldValueInPoint(fieldLayer.elements[0], point, {coords});
		}
		return {fieldName, fieldValue};
	};

	this.drawPoint = (canvas, map, scale, centerx, centery, point) => {
		let ctx = canvas.getContext("2d");
		let dotsPerMeter = canvas.width / (canvas.clientWidth / pixelPerMeter());
		let coords = translator(scale, {x: centerx, y: centery}, dotsPerMeter, {x: canvas.width / 2, y: canvas.height / 2});

		//draw circle in selected point
		let translatedPoint = coords.pointToControl(point);
		ctx.strokeStyle = "#00759C";
		ctx.beginPath();
		ctx.arc(translatedPoint.x, translatedPoint.y, 8, 0, 2 * Math.PI);
		ctx.lineWidth = 4;
		ctx.stroke();
		ctx.moveTo(translatedPoint.x, translatedPoint.y);
		ctx.arc(translatedPoint.x, translatedPoint.y, 1, 0, 2 * Math.PI);
		ctx.lineWidth = 2;
		ctx.stroke();
		ctx.closePath();
	};

	this.highlightDrenageArea = (canvas, map, scale, centerx, centery, drenageArea, styles) => {
		if (!drenageArea) {
			return;
		}
		let context = canvas.getContext("2d");
		let dotsPerMeter = canvas.width / (canvas.clientWidth / pixelPerMeter());
		let areaDrawer = types[drenageArea.type];
		let coords = translator(scale, {x: centerx, y: centery}, dotsPerMeter, {x: canvas.width / 2, y: canvas.height / 2});

		context.save();
		for (let key in styles) {
			context[key] = styles[key];
		}
		areaDrawer.path(drenageArea, {
			context,
			pointToControl: coords.pointToControl
		});
		context.stroke();
		context.restore();
	};

	this.showMap = (canvas, map, {scale, centerx, centery, idle, plainDrawing, selected} = {}) => {
		var updateOnce = once(() => update(canvas));

		var coords;
		var uimode;
		var canvasFlag = canvas.showMapFlag = {};
		var events = new EventEmitter();
		var canvasEvents = canvas.events;
		if (!canvas.events) update(canvas);

		var fin = [];
		function detach() {
			fin.reverse().forEach(f => f());
			fin.length = 0;
		}

		//var resizer = onElementSize(canvas, canvas => process.nextTick(() => update(canvas)));
		var resizer = onElementSize(canvas, canvas => nextTick(() => update(canvas)));
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
			on(canvasEvents, 'pointPicked', (data) => {
				events.emit('pointPicked', data.point, events.scale)
			});
			on(canvasEvents, 'uimode', (data) => {uimode = data.uimode});
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
				var drawFlag = canvas.showMapFlag.mapDrawCycle = {};
				var count = 0;
				var onCheckExecution = () => {
					if (!checkCanvas()) throw new Error('map drawer is detached');
					if (drawFlag !== canvas.showMapFlag.mapDrawCycle) throw new Error('stop');

					if (++count > (uimode ? 20 : 1000)) {
						count = 0;
						var ret = new Promise(resolve => setTimeout(resolve, 0));
						var i = idle && idle();
						if (i) ret = Promise.all([ret, i]);
						return ret;
					}
				};
				events.emit("update.begin", canvas, map);

				var c = onCheckExecution();
				c && (yield c);
				updateCanvasSize(canvas);
				if (!coords) {
					var dotsPerMeter = canvas.width / (canvas.clientWidth / pixelPerMeter());
					if (isNaN(dotsPerMeter)) dotsPerMeter = 3780;

					if (centerx == null) {
						var bounds = rects.middleRect(...map.layers.map(layer => layer.bounds));
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

					coords = translator(scale, {x: centerx, y: centery}, dotsPerMeter, {
						x: canvas.width / 2,
						y: canvas.height / 2
					});
				}

				var C = coords;

				events.scale = C.mscale;
				var p = C.pointToMap({x: canvas.width / 2, y: canvas.height / 2});
				events.centerx = p.x;
				events.centery = p.y;

				canvasEvents && canvasEvents.emit('init', C.changeResolution(1 / devicePixelRatio));

				var onDataWaiting = (plainDrawing || map.mapErrors.length > 0)
					? identity
					: (promise) => promise.then(updateOnce);

				var context = canvas.getContext ? canvas.getContext('2d') : canvas;

				var clearCanvas = () => {
					context.fillStyle = 'white';
					context.fillRect(0, 0, canvas.width, canvas.height, 'white');
				};

				var startPaint = draftDrawing => _startPaint(canvas, map, {
					provider,
					selected,
					coords: C,
					pixelRatio: devicePixelRatio,
					onCheckExecution,
					onDataWaiting,
					draftDrawing,
					events
				});

				if (uimode) {
					clearCanvas();
					yield startPaint(true);
					yield sleep(provider.drawOptions.zoomSleep || 0);
				}
				clearCanvas();
				yield startPaint(false);

				events.emit('update.end', canvas);

			}).catch(e => {e.message !== 'stop' ? logger.error(e) : logger.debug(e)});
		}
	};

	this.updateFieldPalette = types['field'].updatePalette;
};
