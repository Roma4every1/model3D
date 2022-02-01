// module mapDrawer
var logger = require("./logger");
var startThread = require("./startThread");
var geom = require("./geom");
var lodash = require("lodash");

export var types = {};

var declareType = (name, data) => {
	data.name = name;
	types[name] = data;
	return data;
};

function pointBounds(p) { return { min: p, max: p }; }

declareType("namedpoint", {
	bound: pointBounds,

	draft: function ( i, options ) {
		var p = options.pointToControl( i );
		var context = options.context;
		var drawOptions = options.provider.drawOptions;
		context.strokeStyle = drawOptions.selectedColor || "#0000FF";
		context.lineWidth = ( drawOptions.selectedWidth || 0.75 ) * 0.001 * options.dotsPerMeter;
		var s = ( drawOptions.selectedSize || 5 ) * 0.001 * options.dotsPerMeter;
		context.strokeRect( p.x - s / 2, p.y - s / 2, s, s );
	},
} );

function setElementImage(i, imgData) {
	i.img = null;
	i.imgData = imgData;
	i.imgData.then(img => i.img = img);
	return i.imgData;
}

function* getElementImage(i, options) {
	if (!i.img) {
		var r = options.onDataWaiting(i.imgData);
		if (r)
			yield r;
	}
}

var defaultLineWidth = 0.23;
var draftLineWidth = 0.1;
var signSize = 2;

declareType("sign", {
	bound: pointBounds,

	defaultImage: null,

	loaded: (i, provider) => setElementImage(i,
		provider.getSignImage(i.fontname, i.symbolcode, i.color)),

	draft_: function (i, options) {
		var p = options.pointToControl(i);
		var context = options.context;
		context.strokeStyle = i.color;
		context.lineWidth = draftLineWidth * 0.001 * options.dotsPerMeter;
		var s = signSize * 0.001 * options.dotsPerMeter;
		context.strokeRect(p.x - s / 2, p.y - s / 2, s, s);
	},

	draw: function* drawThread(i, options) {
		var img = i.img || ((yield* getElementImage(i, options)), i.img);
		if (!img) {
			return;
		}
		else {
			var p = options.pointToControl(i);
			var w = img.width * i.size * options.pixelRatio;
			var h = img.height * i.size * options.pixelRatio;

			if (options.context.setLineDash)
			{
			    options.context.drawImage(img, p.x - w / 2, p.y - h / 2, w, h);
			}
		}
	},
});

function allPromises(...args) {
	args = args.filter(Boolean);
	return args.length < 2 ? args[0] : Promise.all(args);
}

function checkBoundX(bounds, coord) {
	if (bounds.max.x === undefined || coord > bounds.max.x)
		bounds.max.x = coord;
	if (bounds.min.x === undefined || coord < bounds.min.x)
		bounds.min.x = coord;
}

function checkBoundY(bounds, coord) {
	if (bounds.max.y === undefined || coord > bounds.max.y)
		bounds.max.y = coord;
	if (bounds.min.y === undefined || coord < bounds.min.y)
		bounds.min.y = coord;
}

var field = declareType("field", {
	sourceRenderDataMatrix: null,
	deltasPalette: null,
	lastUsedScale: undefined,
	lastUsedRenderDataMatrix: null,
	lastUsedImageData: null,
	calculationTimer: null,

	bound: (p) => {
		return {
			min: {
				x: p.x,
				y: p.y - p.sizey * p.stepy //kav : p.x & p.y is a left-bottom(!) point. that's why we substract
			},
			max: {
				x: p.x + p.sizex * p.stepx,
				y: p.y
			}
		};
	},
	loaded: (i, provider) => {
		// initialization
		i.sourceRenderDataMatrix = lodash.chunk(field._parseSourceRenderData(i.data), i.sizex).reverse(); //reverse 'cause the source array isn't oriented right
		i.deltasPalette = field._getDeltasPalette(field._getRgbPaletteFromHex(i.palette[0].level));
		i.calculationTimer = {
			isActive: false,
			mainTimer: null,
			innerTimers: [],
			reset: () => {
				i.calculationTimer.innerTimers.forEach((cancellable) => cancellable.cancel());
				i.calculationTimer.innerTimers.length = 0;
				clearTimeout(i.calculationTimer.mainTimer);
				i.calculationTimer.isActive = false;
			}
		};
	},
	draw: function* drawThread(i, options) { // eslint-disable-line
		/*
			* _draw method contains all the logic that used to be here.
			* _draw method invokation is omitted 'cause of performance.
			* the main problem is a huge amount of calculations. I've not found any other
			* way but calculating interpolated field each time a user changes scale.
			* I calculate the whole field (not only the visible area) in order to not to
			* recalculate it again and again for the same scale when moving across the map.
			* Both workers (regular workers) and timers crash browser (either safari or chrome) due the amount
			* of memory used.
			* Hope, one day you'll find the way to render the field in a fast and safe way.
			* UPD: there is sharing memory proposal in ES2017. Maybe it would be a good option when available
		*/
		// field._draw( i, options );
		return;
	},
	getFieldValueInPoint: (i, point, options) => {
		let bounds = field.bound(i);
		// if selected point belongs to field..
		if (point.x >= bounds.min.x && point.x <= bounds.max.x &&
			point.y >= bounds.min.y && point.y <= bounds.max.y) {
			let coords = options.coords;
			let xStart = i.x;
			let yStart = i.y - i.stepy * i.sizey;
			let xStep = i.stepx;
			let yStep = i.stepy;
			let rowLength = i.sourceRenderDataMatrix[0].length;
			let columnLength = i.sourceRenderDataMatrix.length;
			let translatedSourcePoints = [];
			let fromRenderDataToPoint = (value, xIndex, yIndex, xStart, yStart, xStep, yStep) => {
				return {
					x: xStart + (xStep * xIndex),
					y: yStart + (yStep * yIndex),
					value
				};
			};


			//translate sourceRenderDataMatrix to coords
			for (let yIndex = 0; yIndex < columnLength; yIndex++) {
				let translatedRow = [];
				translatedSourcePoints.push(translatedRow);
				for (let xIndex = 0; xIndex < rowLength; xIndex++) {
					let translatedSourcePoint = fromRenderDataToPoint(
						i.sourceRenderDataMatrix[yIndex][xIndex],
						xIndex,
						yIndex,
						xStart,
						yStart,
						xStep,
						yStep
					);
					translatedRow.push(translatedSourcePoint);
					// if (ctx.isPointInPath(Math.round(point.x), Math.round(point.y))){
					//     pointsInsideContour.push(i.sourceRenderDataMatrix[yIndex][xIndex])
					// }
				}
			}

			let indexesOfClosest = {
				row: {
					next: Number.POSITIVE_INFINITY,
					prev: Number.POSITIVE_INFINITY
				},
				col: {
					next: Number.POSITIVE_INFINITY,
					prev: Number.POSITIVE_INFINITY
				}
			};

			let minDistY = Number.POSITIVE_INFINITY;
			translatedSourcePoints.forEach((row, index) => {
				let delta = row[0].y - point.y;
				if (Math.abs(delta) < minDistY) {
					minDistY = Math.abs(delta);
					if (delta < 0) {
						indexesOfClosest.row.prev = index;
						indexesOfClosest.row.next = index + 1;
					}
					else {
						indexesOfClosest.row.next = index;
						indexesOfClosest.row.prev = index - 1;
					}
				}
			});
			let minDistX = Number.POSITIVE_INFINITY;
			translatedSourcePoints[indexesOfClosest.row.prev].forEach((cell, index) => {
				let delta = cell.x - point.x;
				if (Math.abs(delta) < minDistX) {
					minDistX = Math.abs(delta);
					if (delta < 0) {
						indexesOfClosest.col.prev = index;
						indexesOfClosest.col.next = index + 1;
					}
					else {
						indexesOfClosest.col.next = index;
						indexesOfClosest.col.prev = index - 1;
					}
				}
			});
			// now we have source points for rect which clicked-point belong. Interpolate rect's border by X axis
			// then by Y axis to get value. points of square are encoded as 'ne' where 'n' is north, 'e' - east and so on.
			// north and east have greater coord values
			let nw = translatedSourcePoints[indexesOfClosest.row.next][indexesOfClosest.col.prev];
			let ne = translatedSourcePoints[indexesOfClosest.row.next][indexesOfClosest.col.next];
			let sw = translatedSourcePoints[indexesOfClosest.row.prev][indexesOfClosest.col.prev];
			let se = translatedSourcePoints[indexesOfClosest.row.prev][indexesOfClosest.col.next];
			nw.screenCoords = coords.pointToControl(nw);
			ne.screenCoords = coords.pointToControl(ne);
			sw.screenCoords = coords.pointToControl(sw);
			se.screenCoords = coords.pointToControl(se);


			let ewBorderSize = Math.floor(ne.screenCoords.x) - (~~(nw.screenCoords.x));
			let nsBorderSize = Math.floor(ne.screenCoords.y) - (~~(se.screenCoords.y));

			let ewPointBorderIndex = Math.round((ewBorderSize - 1) * (point.x - nw.x) / (ne.x - nw.x));
			let nsPointBorderIndex = Math.round((nsBorderSize - 1) * (point.y - se.y) / (ne.y - se.y));

			let interpolatedUpperBorder = field._interpolateArray([nw.value, ne.value], ewBorderSize);
			let interpolatedBottomBorder = field._interpolateArray([sw.value, se.value], ewBorderSize);

			let target = field._interpolateArray(
				[
					interpolatedBottomBorder[ewPointBorderIndex],
					interpolatedUpperBorder[ewPointBorderIndex]
				],
				nsBorderSize
			)[nsPointBorderIndex];
			return target;
		}
		else {
			return 0;
		}

	},
	getStocksWithinContour: (i, options) => {
		let ctx = options.canvas.getContext("2d");
		let coords = options.coords;
		if (options.contourBuildRequired) {
			let contour = options.contour;

			ctx.strokeStyle = "#FF0000";
			ctx.lineWidth = 3;
			ctx.beginPath();

			let translatedContour = contour.map((p) => coords.pointToControl(p));
			ctx.moveTo(translatedContour[0].x, translatedContour[0].y);
			translatedContour.forEach((item) => {
				ctx.lineTo(item.x, item.y);
			});
			ctx.lineTo(translatedContour[0].x, translatedContour[0].y);
		}

		let fromRenderDataToPoint = (value, xIndex, yIndex, xStart, yStart, xStep, yStep) => {
			return {
				x: xStart + (xStep * xIndex),
				y: yStart + (yStep * yIndex),
				value
			};
		};

		let xStart = i.x;
		let yStart = i.y - i.stepy * i.sizey;
		let xStep = i.stepx;
		let yStep = i.stepy;

		let pointsInsideContour = [];
		let rowLength = i.sourceRenderDataMatrix[0].length;
		let columnLength = i.sourceRenderDataMatrix.length;
		let pointsArr = [];
		for (let yIndex = 0; yIndex < columnLength; yIndex++) {
			for (let xIndex = 0; xIndex < rowLength; xIndex++) {
				let point = coords.pointToControl(
					fromRenderDataToPoint(
						i.sourceRenderDataMatrix[yIndex][xIndex],
						xIndex,
						yIndex,
						xStart,
						yStart,
						xStep,
						yStep
					)
				);
				pointsArr.push(point);
				if (ctx.isPointInPath(Math.round(point.x), Math.round(point.y))) {
					pointsInsideContour.push(i.sourceRenderDataMatrix[yIndex][xIndex]);
				}
			}
		}
		let summaryStocks = pointsInsideContour.reduce((acc, item) => {
			if (!item) {
				return acc;
			}
			return (acc += item);
		}, 0);

		return summaryStocks * xStep * yStep;
	},
	updatePalette: (i, newPalette) => {
		i.deltasPalette = field._getDeltasPalette(field._getRgbPaletteFromHex(newPalette));
		i.lastUsedScale = undefined; // for rebuilding on redraw
	},
	_getVisiblePartOfField: (sourceRenderDataMatrix, fieldBounds, drawBounds) => {
		let xSize = sourceRenderDataMatrix[0].length;
		let ySize = sourceRenderDataMatrix.length;
		let xIntersectStartIndex = ~~(xSize * field._getIntersectionStartPercent(fieldBounds, drawBounds, "x"));
		let yIntersectStartIndex = ~~(ySize * field._getIntersectionStartPercent(fieldBounds, drawBounds, "y"));
		let xIntersectEndIndex = Math.ceil(xSize * field._getIntersectionEndPercent(fieldBounds, drawBounds, "x"));
		let yIntersectEndIndex = Math.ceil(ySize * field._getIntersectionEndPercent(fieldBounds, drawBounds, "y"));
		//filtering
		return sourceRenderDataMatrix.reduce((acc, row, rowIndex) => {
			if (rowIndex >= yIntersectStartIndex && rowIndex <= yIntersectEndIndex) {
				return acc.concat(
					row.filter((i, colIndex) => {
						if (colIndex >= xIntersectStartIndex && colIndex <= xIntersectEndIndex) {
							return true;
						}
						return false;
					})
				);
			}
			return acc;
		}, []);
	},
	_getIntersectionStartPercent: (fieldBounds, drawBounds, dimension) => {
		let intersectStartPercent;
		if (fieldBounds.min[dimension] >= drawBounds.min[dimension]) {
			intersectStartPercent = 0;
		}
		else {
			intersectStartPercent = (drawBounds.min[dimension] - fieldBounds.min[dimension]) /
				(fieldBounds.max[dimension] - fieldBounds.min[dimension]);
		}
		return intersectStartPercent;
	},
	_getIntersectionEndPercent: (fieldBounds, drawBounds, dimension) => {
		let intersectEndPercent;
		if (fieldBounds.max[dimension] <= drawBounds.max[dimension]) {
			intersectEndPercent = 1;
		}
		else {
			intersectEndPercent = (drawBounds.max[dimension] - fieldBounds.min[dimension]) / (fieldBounds.max[dimension] - fieldBounds.min[dimension]);
		}
		return intersectEndPercent;
	},
	_parseSourceRenderData: (stringData) => {
		// parse string "n*50 123.123 132.323 ..." to an array (n*50 is equal to repeating null 50 times)
		let data = stringData.split(" ");
		let ret = [];
		let lgth = data.length;
		for (let i = 0; i < lgth; i++) {
			let val = data[i];
			let starIndex = val.indexOf("*");
			if (starIndex === -1) {
				ret.push(+val);
			} else {
				let arr = val.split("*");
				let valToPush = (arr[0] === "n") ? null : (+arr[0]); //toNumber
				let counter = arr[1];
				for (let j = counter; j > 0; j--) {
					ret.push(valToPush);
				}
			}
		}
		return ret;
	},
	_getRgbPaletteFromHex: (hexPalette) => {
		return hexPalette.map((item) => {
			let hexColorsArr = lodash.chunk(item.color.slice(1).split(""), 2)
				.map((i) => i.join(""));
			return {
				hexColor: item.color,
				value: item.value,
				red: parseInt(hexColorsArr[0], 16),
				green: parseInt(hexColorsArr[1], 16),
				blue: parseInt(hexColorsArr[2], 16)
			};
		});
	},
	_getDeltasPalette: (palette) => {
		return palette
			.sort((a, b) => (a.value - b.value))
			.reduce((acc, item, index, arr) => {
				if (index !== arr.length - 1) {
					var ret = {
						min: item.value,
						max: arr[index + 1].value,
						delta: arr[index + 1].value - item.value,
						redStart: item.red,
						greenStart: item.green,
						blueStart: item.blue,
						redDelta: arr[index + 1].red - item.red,
						greenDelta: arr[index + 1].green - item.green,
						blueDelta: arr[index + 1].blue - item.blue
					};
					return acc.concat(ret);
				}
				return acc;
			}, []);
	},
	_interpolateArray: (data, fitCount) => {
		let newData = [];
		let springFactor = (data.length - 1) / (fitCount - 1);
		newData[0] = data[0];
		for (let i = 1; i < fitCount - 1; i++) {
			let tmp = i * springFactor;
			let before = ~~(tmp).toFixed();
			let after = Math.ceil(tmp).toFixed();
			let atPoint = tmp - before;
			newData[i] = field._linearInterpolate(data[before], data[after], atPoint);
		}
		newData[fitCount - 1] = data[data.length - 1];
		return newData;
	},
	_linearInterpolate: (before, after, atPoint) => {
		return before + (after - before) * atPoint;
	},
	_getPaletteDeltaForValue: (value, deltasPalette) => {
		for (var i = deltasPalette.length - 1; i >= 0; i--) {
			if (value >= deltasPalette[i].min && value <= deltasPalette[i].max) {
				return deltasPalette[i];
			}
		}
	},
	_getRenderArrayFromData: (renderData, sizex, sizey, deltasPalette) => {
		var renderArr = new Uint8ClampedArray(sizex * sizey * 4);
		for (var i = 0; i < renderData.length; i++) {
			if (renderData[i] === null || renderData[i] === 0 || isNaN(renderData[i])) {
				renderArr[i * 4] = 255;
				renderArr[i * 4 + 1] = 255;
				renderArr[i * 4 + 2] = 255;
				renderArr[i * 4 + 3] = 255;
				continue;
			}
			var currentPalette = field._getPaletteDeltaForValue(renderData[i], deltasPalette);
			if (!currentPalette) {
				renderArr[i * 4] = 255;
				renderArr[i * 4 + 1] = 255;
				renderArr[i * 4 + 2] = 255;
				renderArr[i * 4 + 3] = 255;
				continue;
			}
			var deltaCoef = (renderData[i] - currentPalette.min) / currentPalette.delta;
			renderArr[i * 4] = currentPalette.redStart + (~~(deltaCoef * currentPalette.redDelta));
			renderArr[i * 4 + 1] = currentPalette.greenStart + (~~(deltaCoef * currentPalette.greenDelta));
			renderArr[i * 4 + 2] = currentPalette.blueStart + (~~(deltaCoef * currentPalette.blueDelta));
			renderArr[i * 4 + 3] = 255;
		}
		return renderArr;
	},
	_draw: (i, options) => {
		if (i.calculationTimer.isActive) {
			return;
		}
		let context = options.context;
		let firstRenderPoint = options.pointToControl({
			x: i.x,
			y: i.y - i.sizey * i.stepy
		});
		let secondRenderPoint = options.pointToControl({
			x: i.x + i.sizex * i.stepx,
			y: i.y
		});
		let newSizex = ~~Math.abs(firstRenderPoint.x - secondRenderPoint.x);
		let newSizey = ~~Math.abs(firstRenderPoint.y - secondRenderPoint.y);

		let doUseSavedRenderData;
		if (options.scale === i.lastUsedScale) {

			doUseSavedRenderData = true;
		} else {
			//recalculate matrix and cancel previous calculations
			doUseSavedRenderData = false;
			i.calculationTimer.reset();
		}
		i.lastUsedScale = options.scale;

		if (doUseSavedRenderData && i.lastUsedImageData) {
			context.putImageData(i.lastUsedImageData, firstRenderPoint.x, firstRenderPoint.y);
			return;
		}
		options.events.emit("fieldCalculationStarted");
		i.calculationTimer.mainTimer = setTimeout(() => {
			i.calculationTimer.isActive = true;
			let newRenderDataRows = i.sourceRenderDataMatrix.map(row => field._interpolateArray(row, newSizex));
			//calculate each column in a separate thread and return result column as a promise
			for (let c = 0; c < newSizex; c++) { // c is for column
				let innerTimer;
				let promise = new Promise((resolve, reject) => {
					innerTimer = setTimeout(() => {
						let column = field._interpolateArray(Array.from({
							length: i.sizey
						}, (k, v) => newRenderDataRows[v][c]), newSizey);
						resolve(column);
					}, 20 + c * 25);
				});

				i.calculationTimer.innerTimers.push({
					promise,
					cancel: () => {
						clearTimeout(innerTimer);
					}
				});
			}

			//when all the columns are recalculated, collect all the result and set as i.lastUsedImageData
			Promise.all(i.calculationTimer.innerTimers.map((item) => item.promise))
				.then((columnsArr) => {
					let newRenderDataMatrix = []; //from columnsArr -> rowsArr
					for (let r = 0; r < newSizey; r++) {
						let row = columnsArr.map((column) => column[r]);
						newRenderDataMatrix.push(row);
					}
					i.lastUsedRenderDataMatrix = newRenderDataMatrix;
					let currentRenderArr = field._getRenderArrayFromData(
						lodash.flatten(
							newRenderDataMatrix
						),
						newSizex,
						newSizey,
						i.deltasPalette
					);
					let imgData = context.createImageData(newSizex, newSizey);
					for (let index = 0; index < newSizex * newSizey * 4; index++) {
						imgData.data[index] = currentRenderArr[index];
					}
					i.lastUsedImageData = imgData;
					i.calculationTimer.isActive = false;
					options.events.emit("fieldCalculationFinished");
					options.events.emit("update");
				});
		}, 20);
	}
});

var polyline = declareType("polyline", {
	borderStyles: ["Solid", "Dash", "Dot", "DashDot", "DashDotDot", "Clear"],

	styleShapes: {
		Solid: [],
		Dash: [5, 1],
		Dot: [1, 1],
		DashDot: [5, 1, 1, 1],
		DashDotDot: [5, 1, 1, 1, 1, 1],
		Clear: [],
	},

	bound: function (p) {
		if (p.bounds)
			return p.bounds;
		if (!p.arcs)
			return undefined;
		var bounds = {
			"max": {
				"x": undefined,
				"y": undefined
			},
			"min": {
				"x": undefined,
				"y": undefined
			}
		};
		p.arcs.forEach(function (arcItem) {
			arcItem.path.forEach(function (coord, ind) {
				if (ind % 2 === 0) {
					checkBoundX(bounds, coord);
				}
				else {
					checkBoundY(bounds, coord);
				}
			});
		});

		return bounds;
	},

	loaded: (i, provider) => allPromises(
		i.fillname && setElementImage(i, provider.getPatternImage(
			i.fillname, i.fillcolor, i.transparent ? "none" : i.fillbkcolor)),  //commented 'cause sometimes transparent is set to true for non-transparent elements. (ex. "HALFTONE-64")
		i.borderstyleid && provider.getLinesDefStub && provider.getLinesDefStub() &&
		(provider.getLinesDefStub().then(stub => i.style = stub && stub[i.borderstyleid]), true)
	),

	path: function (i, options) {
		var context = options.context;
		context.beginPath();
		var f;
		for (var a of i.arcs) {
			var start = true;
			var x = null;
			for (var c of a.path) {
				if (x == null)
					x = c;
				else {
					var p = options.pointToControl({ x, y: c });
					if (start) {
						context.moveTo(p.x, p.y);
						f = p;
						start = false;
					}
					else
						context.lineTo(p.x, p.y);
					x = null;
				}
			}
			if (i.closed && i.arcs.length > 1 && f != null)
				context.lineTo(f.x, f.y);
		}
		if (i.closed && i.arcs.length === 1)
			context.closePath();
	},

	decorationPath: function (i, options, lineConfig) {
		var fillSegmentWithDecoration = function (ctx, lineConfig, point, lpoint, overhead, i, options) {
			var scale = options.pixelRatio;
			var decorations = lineConfig.Decoration;

			if (!decorations) {
				overhead = null;
				return;
			}

			for (var k = decorations.length - 1; k >= 0; k--) {
				var decoration = decorations[k];

				if (decoration.thickness) {
					ctx.lineWidth = scale * decoration.thickness._value *
						(i.borderwidth || defaultLineWidth) *
						0.001 *
						options.dotsPerMeter;  // Thickness
				}
				else {
					ctx.lineWidth = scale * (i.borderwidth || defaultLineWidth) * 0.001 * options.dotsPerMeter;
				}
				if (decoration.color)
					ctx.strokeStyle = decoration.color._value;

				var offx = decoration.offsetX._value * scale;
				var offy = decoration.offsetY._value * scale;

				var shape = decoration.Shape[0];
				var lines = shape.Line;

				var interval = decoration.interval._value * scale;
				if (!overhead[k] || overhead[k] === 0) {
					i = decoration.initialInterval._value * scale;
				}
				else {
					i = overhead[k];
				}

				// calculate the angle of the main line
				var dx = point.x - lpoint.x;
				var dy = point.y - lpoint.y;
				var mainAngle = Math.atan2(dy, dx);
				// ---
				// calculate the length of the line
				var lineLength = Math.sqrt(dx * dx + dy * dy);
				// ---

				while (i < lineLength && interval > 0) {
					// calculate the start point for decoration
					// (overlay i over the line, get last point)
					dx = i;
					dy = 0;
					var _dx = dx * Math.cos(mainAngle) - dy * Math.sin(mainAngle);
					var _dy = dx * Math.sin(mainAngle) + dy * Math.cos(mainAngle);
					var tempx = _dx + lpoint.x;
					var tempy = _dy + lpoint.y;
					// ---

					// draw
					for (var j = lines.length - 1; j >= 0; j--) {
						var line = lines[j];

						var x1 = line.x1._value * scale + tempx + offx;
						var y1 = line.y1._value * scale + tempy + offy;
						var x2 = line.x2._value * scale + tempx + offx;
						var y2 = line.y2._value * scale + tempy + offy;
						// for customization purposes, I store the angle here as well
						var decorationAngle = mainAngle - Math.PI / 2;
						// turning the first point
						dx = x1 - tempx;
						dy = y1 - tempy;
						_dx = dx * Math.cos(decorationAngle) - dy * Math.sin(decorationAngle);
						_dy = dx * Math.sin(decorationAngle) + dy * Math.cos(decorationAngle);
						var decx1 = _dx + tempx;
						var decy1 = _dy + tempy;
						// turning the second point
						dx = x2 - tempx;
						dy = y2 - tempy;
						_dx = dx * Math.cos(decorationAngle) - dy * Math.sin(decorationAngle);
						_dy = dx * Math.sin(decorationAngle) + dy * Math.cos(decorationAngle);
						var decx2 = _dx + tempx;
						var decy2 = _dy + tempy;

						ctx.moveTo(decx1, decy1);
						ctx.lineTo(decx2, decy2);
					}
					// ---

					i += interval;
				}
				// If we have a line length of 10 and decoration interval of 3,
				// then the overhead will be 10 - 3*4 = 2. The next decoration
				// will start at 2 pixels.
				// If no decorations were drawn, but the overhead exists, then
				// it will be gradually lowered to draw at least one decoration
				// at successive small sections.
				if (overhead[k] === i) {
					overhead[k] -= lineLength;
				}
				else {
					overhead[k] = i - lineLength;
				}
			}

			// finalize
			//return i - lineLength;
			return overhead;
		};

		var lastPoint = null;
		var overhead = [];

		var context = options.context;
		context.beginPath();
		var f;
		for (var a of i.arcs) {
			var start = true;
			var x = null;
			for (var c of a.path) {
				if (x == null)
					x = c;
				else {
					var p = options.pointToControl({ x, y: c });
					if (start) {
						context.moveTo(p.x, p.y);
						f = p;
						start = false;
					}
					else {
						overhead = fillSegmentWithDecoration(context, lineConfig, p, lastPoint, overhead, i, options);
					}
					lastPoint = p;
					x = null;
				}
			}
			if (i.closed && i.arcs.length > 1 && f != null)
				context.lineTo(f.x, f.y);
		}
		if (i.closed && i.arcs.length === 1)
			context.closePath();
	},

	draft: function (i, options) {
		var configThicknessCoefficient = options.pixelRatio;
		var context = options.context;

		var lconfig = [];
		if (options.provider.linesConfigJson)
			lconfig = options.provider.linesConfigJson.data.BorderStyles[0].Element;

		var currentLineConfig = [];
		if (i.borderstyleid)
		{
			currentLineConfig = [lconfig.find(e => e.guid._value === i.borderstyleid)];
		}
		if (currentLineConfig.length !== 0) {
			i.style = currentLineConfig[0];
		}
		else {
			// some action here
		}
		// ---

		polyline.path(i, options);
		var color = i.bordercolor || i.fillcolor || i.fillbkcolor || "#000000";
		context.strokeStyle = color;
		context.lineWidth = (i.borderwidth || defaultLineWidth) * 0.001 * options.dotsPerMeter;
		// if a default style is present, set dash
		if (i.borderstyle !== undefined && i.borderstyle != null) {
			var baseThicknessCoefficient = Math.round(i.borderwidth / defaultLineWidth);
			var dash = polyline.styleShapes[polyline.borderStyles[i.borderstyle]].slice();
			for (var j = dash.length - 1; j >= 0; j--) {
				dash[j] = dash[j] * configThicknessCoefficient * baseThicknessCoefficient;
			}
			if (context.setLineDash) {
				context.setLineDash(dash);
			}
		}

		// заглушка для ВНК да рэалізацыі lines.def
		if (i.style) {
			if (i.style.baseColor)
				context.strokeStyle = i.style.baseColor._value;
			else
				context.strokeStyle = "black";
			if (i.style.baseThickness)
				context.lineWidth = i.style.baseThickness._value * (i.borderwidth || defaultLineWidth) * 0.001 * options.dotsPerMeter;  // Thickness
			else
				context.lineWidth = (i.borderwidth || defaultLineWidth) * 0.001 * options.dotsPerMeter;
			// Enable this of you want to live^W draw dashed lives in draft
			/*if (i.style.StrokeDashArrays) {
				var dashObj = i.style.StrokeDashArrays[0].StrokeDashArray[0];
				if (dashObj.onBase._value) {
					var dashes = dashObj.data._value.split(' ');
					context.setLineDash(dashes);
					if (dashObj.color)
						context.strokeStyle = dashObj.color._value;
				}
			}
			*/
		}

		context.stroke();
		if (context.setLineDash) {
			context.setLineDash([]);
		}
	},

	draw: function* drawThread(i, options) {
		var configThicknessCoefficient = options.pixelRatio;	// Thickness coefficient for all lines defined in lines.json/xml
		var context = options.context;

		// Checking if there a config for the current type of line
		var lconfig = [];
		if (options.provider.linesConfigJson)
			lconfig = options.provider.linesConfigJson.data.BorderStyles[0].Element;

		var currentLineConfig = [];
		if (i.borderstyleid)
		{
			currentLineConfig = [lconfig.find(e => e.guid._value === i.borderstyleid)];
		}
		if (currentLineConfig.length !== 0) {
			i.style = currentLineConfig[0];
		}
		else {
			// some action here
		}
		// ---

		var pathNeeded = lodash.once(() => polyline.path(i, options));

		if (i.fillname) {
			pathNeeded();
			var img = i.img || ((yield* getElementImage(i, options)), i.img);
			if (img) {
				if (typeof img === "string") {
					if (i.transparent) {
						img = img.substring(0, img.length - 2)
						img += "0.3)"
					}
					context.fillStyle = img;
				} else {
					context.fillStyle = context.createPattern(img, "repeat");
				}
				context.fill();
			}
		}
		else if (!i.transparent) {
			pathNeeded();
			context.fillStyle = i.fillbkcolor;
			context.fill();
		}
		if (!i.bordercolor || i.bordercolor === "none")
			return;
		var borderstyle = polyline.borderStyles[i.borderstyle];
		if (borderstyle === "Clear")
			return;
		if (!borderstyle)
			borderstyle = "Solid";
		pathNeeded();
		context.strokeStyle = i.bordercolor;
		context.lineWidth = (i.borderwidth || defaultLineWidth) * 0.001 * options.dotsPerMeter;
		// if a default style is present, set dash
		if (i.borderstyle !== undefined && i.borderstyle != null) {
			var baseThicknessCoefficient = Math.round(i.borderwidth / defaultLineWidth);
			var dash = polyline.styleShapes[polyline.borderStyles[i.borderstyle]].slice();
			for (let j = dash.length - 1; j >= 0; j--) {
				dash[j] = dash[j] * configThicknessCoefficient * baseThicknessCoefficient;
			}
			if (context.setLineDash) {
				context.setLineDash(dash);
			}
		}

		// заглушка для ВНК да рэалізацыі lines.def
		if (i.style) {
			if (i.style.baseColor)
				context.strokeStyle = i.style.baseColor._value;
			else
				context.strokeStyle = "black";
			if (i.style.baseThickness)
				context.lineWidth = configThicknessCoefficient * i.style.baseThickness._value * (i.borderwidth || defaultLineWidth) * 0.001 * options.dotsPerMeter;  // Thickness
			else
				context.lineWidth = configThicknessCoefficient * (i.borderwidth || defaultLineWidth) * 0.001 * options.dotsPerMeter;
			if (i.style.StrokeDashArrays) {
				var dashObj = i.style.StrokeDashArrays[0].StrokeDashArray[0];
				if (dashObj.onBase._value) {
					var dashes = dashObj.data._value.split(" ");
					for (let j = dashes.length - 1; j >= 0; j--) {
						dashes[j] = dashes[j] * configThicknessCoefficient;
					}
					if (context.setLineDash) {
						context.setLineDash(dashes);
					}
					if (dashObj.color)
						context.strokeStyle = dashObj.color._value;
				}
			}
		}
		if (i.selected)
		{
			context.lineWidth = (i.borderwidth || defaultLineWidth) * 0.01 * options.dotsPerMeter;
		}

		context.stroke();
		if (context.setLineDash) {
			context.setLineDash([]);
		}

		if (i.style) {
			var decorationPathNeeded = lodash.once(() => polyline.decorationPath(i, options, i.style));
			decorationPathNeeded();
			context.stroke();
			if (context.setLineDash) {
				context.setLineDash([]);
			}
		}
	}
});

var label = declareType("label", {

	alHorLeft: 0,
	alHorCenter: 1,
	alHorRight: 2,

	alVerBottom: 0,
	alVerCenter: 1,
	alVerTop: 2,

	bound: pointBounds,

	draw: function* drawThread(i, options) { // eslint-disable-line

		var fontsize = i.fontsize * // pt
			(1 / 72 * 0.0254) * // meters
			options.dotsPerMeter; // pixels

		if (fontsize < 2) return;

		var context = options.context;
		context.font = fontsize + "px " + i.fontname;

		var p = options.pointToControl(i);
		p.x += (i.xoffset || 0) * 0.001 * options.dotsPerMeter;
		p.y -= (i.yoffset || 0) * 0.001 * options.dotsPerMeter;

		context.textAlign = "left";
		context.textBaseline = "top";

		var text = (x, y) => {
			var width = context.measureText(i.text).width;

			switch (i.halignment) {
				case label.alHorRight:
					x -= width + 2; // magic
					break;
				case label.alHorCenter:
					x -= width / 2 + 1; // magic
					break;
				default:
					break;
			}
			switch (i.valignment) {
				case label.alVerBottom:
					y -= fontsize + 2; // magic
					break;
				case label.alVerCenter:
					y -= fontsize / 2 + 1; // magic
					break;
				default:
					break;
			}
			context.fillStyle = "white";
			context.fillRect(x, y, width, fontsize + 3); // magic
			context.fillStyle = i.color === "#FFFFFF" ? "black" : i.color; // color inversion because of mm background is not the same as gmmo
			context.fillText(i.text, x, y);
		};
		if (i.angle) {
			context.save();
			context.translate(p.x, p.y);
			context.rotate(-i.angle / 180 * Math.PI);
			text(0, 0);
			context.restore();
		}
		else
			text(p.x, p.y);
	},
});

declareType("pieslice", {
	bound: pointBounds,
	draw: function* drawThread(i, options) { // eslint-disable-line
		var context = options.context;
		var maxRadius = 16;
		var minRadius = 2;
		var p = options.pointToControl(i);
		var customIncreaseCoefficient = 1.5;
		// radius restrictions
		if (i.radius > maxRadius) i.radius = maxRadius;
		if (i.radius < minRadius) i.radius = minRadius;
		var r = i.radius * 0.001 * options.dotsPerMeter * customIncreaseCoefficient;
		context.beginPath();
		if (!(i.startangle === 0 && Math.abs(i.endangle - 2 * Math.PI) < 1e-6))
			context.moveTo(p.x, p.y);
		context.arc(p.x, p.y, r, i.startangle + Math.PI / 2, i.endangle + Math.PI / 2, false);
		context.closePath();
		var drawOptions = options.provider.drawOptions || {};
		context.strokeStyle = (drawOptions.piesliceBorderColor || "black"); // i.bordercolor
		context.lineWidth = (drawOptions.piesliceBorderWidth || 0.2) * 0.001 * options.dotsPerMeter;
		var gradient = context.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
		gradient.addColorStop(0, "white");
		gradient.addColorStop(1, i.color);
		context.fillStyle = gradient; // i.color
		context.globalAlpha = drawOptions.piesliceAlpha || 0.7;
		context.fill();
		context.globalAlpha = 1;
		context.stroke();
	},
});

function Value(value, whenNull) {
	if (value == null)
		return whenNull();
	else
		return value;
}

function isLayerVisible(layer, map) {
	return layer.visible;
}

function nullGetter() {
	return null;
}

function getNullGetter() {
	return nullGetter;
}

export function startPaint(canvas, map, options) {
	// to stop painting set the options.check callback and
	// throw an exception inside it.
	// options.check may return a Promise ( or Thenable ) to pause drawing

	/*

	obligatory:

	options.scale
	options.dotsPerMeter

	optianal:

	options.onIdle
	*/

	var start = Date.now();

	var pixelRatio = options.pixelRatio || 1;
	var coords = options.coords;
	var scale = coords.mscale;
	var dotsPerMeter = coords.cscale;
	var onCheckExecution = Value(options.onCheckExecution, () => null);
	var onDataWaiting = Value(options.onDataWaiting, getNullGetter);

	var exactBounds = geom.rects.joinPoints(
		coords.pointToMap({ x: 0, y: 0 }),
		coords.pointToMap({ x: canvas.width, y: canvas.height })
	);
	var drawBounds = geom.rects.inflate(exactBounds, 0.1 * Math.max(
		exactBounds.max.x - exactBounds.min.x,
		exactBounds.max.y - exactBounds.min.y
	));

	var context = canvas.getContext ? canvas.getContext("2d") : canvas;

	var drawOptions = {
		provider: options.provider,
		selected: options.selected,
		pointToControl: coords.pointToControl,
		context,
		dotsPerMeter,
		pixelRatio,
		map,
		onDataWaiting,
		scale,
		drawBounds: exactBounds,
		events: options.events
	};

	return startThread(function* paintThread() {
		var L = logger.createLogger("DRAW");
		var done = false;
		var mapDrawn = 0;

		// REMOVE IN RELEASE

		L.info("starting draw map cycle", map, drawBounds, scale);
		try {
			for (var layer of map.layers) {
				L.info("processing layer", "(", layer.name, ")", layer);

				L.info("checking if layer is not hidden");
				if (!L.info(isLayerVisible(layer, map)))
					continue;

				L.info("checking if layer is visible within the scale", scale);
				if (!L.info(coords.scaleVisible(layer)))
					continue;

				L.info("checking if layer bounds intersect the drawing area", drawBounds);
				if (!L.info(geom.rects.intersects(drawBounds, layer.bounds)))
					continue;

				var c = onCheckExecution();
				c && (yield c);

				var total = 0;
				var drawn = 0;

				if (!layer.elements) {
					let r = onDataWaiting(layer.elementsData);
					if (r)
						yield r;
				}
				if (layer.elements) for (let element of layer.elements) {
					if (total === 0)
						L.info("type of first element in sublayer is", element.type);
					++total;
					let D = types[element.type];
					if (!geom.rects.intersects(drawBounds, D.bound(element)))
						continue;

				    c = onCheckExecution();
					c && (yield c);

					++drawn;
					++mapDrawn;
					if (D.draw && !options.draftDrawing) {
						yield* D.draw(element, drawOptions);
					}
					else if (D.draft) {
						D.draft(element, drawOptions);
					}
				}
				L.info("Layer ( ", layer.name, " ). ", drawn, "of total", total, "elements are drawn. ", total - drawn, " are outside of the painted area");
			}

			if (map.type !== "profile" && !map.points) {
				let r = onDataWaiting(map.pointsData);
				if (r)
					yield r;
			}
			if (map.points && drawOptions.selected && drawOptions.selected.indexOf) {
				let D = types["namedpoint"];
				if (D) for (let element of map.points) {
					if (!geom.rects.intersects(drawBounds, D.bound(element)))
						continue;
					if (drawOptions.selected.indexOf(element.name) >= 0 ||
						drawOptions.selected.indexOf(element.uwid || element.UWID) >= 0
					) {
						if (D.draw && !options.draftDrawing)
							yield* D.draw(element, drawOptions);
						else if (D.draft)
							D.draft(element, drawOptions);
					}
				}
			}

			done = true;
		} finally {
			if (done)
				L.info("draw map cycle is finished successfully");
			else
				L.info("UPS. draw map cycle has been interrupted by smth");
			L.info(mapDrawn, "elements are drawn.");
			L.info((Date.now() - start) / 1000);
		}
	});
}
