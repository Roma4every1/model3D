import * as _ from 'lodash';
import parseColor from 'parse-color';
import { getLabelTextNumberArray } from './label-text-parser';
import { fillPatterns } from '../../../shared/drawing';
import { rects } from './geom';
import { provider } from './index';
import linesDefStub from './lines.def.stub.json';


/** ## Типы отрисовщика:
 * + `'namedpoint'`
 * + `'sign'`
 * + `'field'`
 * + `'polyline'`
 * + `'label'`
 * + `'pieslice'`
 * @see MapTypes
 * */
export const types = {};

/* --- Utils --- */

const twoPi = 2 * Math.PI;
const defaultLineWidth = 0.23;

/** @return Bounds */
function pointBounds(point) {
  return {min: point, max: point}
}

function checkBoundX(bounds, x) {
  if (bounds.max.x === undefined || x > bounds.max.x) bounds.max.x = x;
  if (bounds.min.x === undefined || x < bounds.min.x) bounds.min.x = x;
}

function checkBoundY(bounds, y) {
  if (bounds.max.y === undefined || y > bounds.max.y) bounds.max.y = y;
  if (bounds.min.y === undefined || y < bounds.min.y) bounds.min.y = y;
}

function declareType(name, data) {
  data.name = name;
  types[name] = data;
  return data;
}

/* --- Types Declaration --- */

declareType('namedpoint', {
  bound: pointBounds,

  draft: (i, options) => {
    const p = options.pointToControl(i);
    const context = options.context;
    const drawOptions = options.provider.drawOptions;
    context.strokeStyle = drawOptions.selectedColor || '#0000ff';
    context.lineWidth = (drawOptions.selectedWidth || 0.75) * 0.001 * options.dotsPerMeter;
    const s = (drawOptions.selectedSize || 5) * 0.001 * options.dotsPerMeter;
    context.strokeRect(p.x - s / 2, p.y - s / 2, s, s);
  },
});

declareType('sign', {
  bound: pointBounds,

  loaded: async (i) => {
    i.img = await provider.getSignImage(i.fontname, i.symbolcode, i.color);
  },

  draw: (i, options) => {
    const img = i.img;
    if (!img) return;

    const point = options.pointToControl(i);
    let width = img.width * i.size * options.pixelRatio;
    let height = img.height * i.size * options.pixelRatio;

    if (i.selected) {
      width *= 2;
      height *= 2;
    }
    options.context.drawImage(img, point.x - width / 2, point.y - height / 2, width, height);
  },
});

var field = declareType('field', {
  sourceRenderDataMatrix: null,
  deltasPalette: null,
  sX: null,
  sY: null,
  preCalculatedSpectre: null,

  bound: (p) => {
    return {
      min: {x: p.x, y: p.y - p.sizey * p.stepy},
      max: {x: p.x + p.sizex * p.stepx, y: p.y},
    };
  },

  loaded: (i) => {
    i.sourceRenderDataMatrix = _.chunk(field._parseSourceRenderData(i.data), i.sizex).reverse(); //reverse 'cause the source array isn't oriented right
    i.deltasPalette = field._getDeltasPalette(field._getRgbPaletteFromHex(i.palette[0].level));
    i.preCalculatedSpectre = field._getDeltasPreCalculatedPalettes(i.deltasPalette);
    i.lastUsedPalette = _.cloneDeep(i.palette);
    i.sX = 1 / i.stepx;
    i.sY = 1 / i.stepy;
  },

  _getInterpolatedArrayValues: (i, arrayX, y) => {
    const resultArray = [];

    if (y === undefined || Number.isNaN(y)) {
      return [...Array(arrayX.length).fill(null)];
    }

    const maxY = i.y;
    const minY = maxY - (i.sizey - 1) * i.stepy;

    if (y < minY || maxY < y) {
      return [...Array(arrayX.length).fill(null)];
    }

    const sY = i.sY;
    const sX = i.sX;

    const relativeToFieldY = y - minY;
    const relativeToCellY = ((relativeToFieldY % i.stepy) * sY); // 1*

    const i1 = Math.floor(relativeToFieldY * sY); // 1*

    if (i1 >= i.sizey || i1 < 0) return [...Array(arrayX.length).fill(null)];

    for (let x of arrayX) {
      const minX = i.x;
      const maxX = minX + (i.sizex - 1) * i.stepx;

      if (x < minX || maxX < x) {
        resultArray.push(null);
        continue;
      }

      const relativeToFieldX = x - minX;
      const j1 = Math.floor(relativeToFieldX * sX); // 1*

      if (j1 >= i.sizex || j1 < 0) {
        resultArray.push(null);
        continue;
      }

      const f00 = i.sourceRenderDataMatrix[i1][j1]
      const f10 = i1+1 === i.sizey ? null : i.sourceRenderDataMatrix[i1 + 1][j1];
      const f01 = j1+1 === i.sizex ? null : i.sourceRenderDataMatrix[i1][j1 + 1]
      const f11 = (i1+1 === i.sizex) && (j1+1 === i.sizey) ? null : i.sourceRenderDataMatrix[i1 + 1][j1 + 1]

      let s = 0;
      if (f00 != null) {
        s++;
      }
      if (f10 != null) {
        s++;
      }
      if (f01 != null) {
        s++;
      }
      if (f11 != null) {
        s++;
      }

      if (s <= 2) {
        resultArray.push(null);
        continue;
      }

      const relativeToCellX = ((relativeToFieldX % i.stepx) * sX); // 1*
      const compositionXY = relativeToCellX * relativeToCellY; // 1*

      if (s === 3) {
        if (f00 == null) {
          let a = 1 - relativeToCellX;
          let b = 1 - relativeToCellY;
          let c = 1 - a - b;
          if (c < 0) {
            resultArray.push(null);
            continue;
          }
          resultArray.push(a * f10 + b * f01 + c * f11);
          continue;
        }

        if (f01 == null) {
          let a = relativeToCellX;
          let b = 1 - relativeToCellY;
          let c = 1 - a - b;
          if (c < 0) {
            resultArray.push(null);
            continue;
          }
          resultArray.push(a * f11 + b * f00 + c * f10);
          continue;
        }

        if (f10 == null) {
          let a = (1 - relativeToCellX);
          let b = relativeToCellY;
          let c = 1 - a - b;
          if (c < 0) {
            resultArray.push(null);
            continue;
          }
          resultArray.push(a * f00 + b * f11 + c * f01);
          continue;
        }

        if (f11 == null) {
          let a = relativeToCellX;
          let b = relativeToCellY;
          let c = 1 - a - b;
          if (c < 0) {
            resultArray.push(null);
            continue;
          }
          resultArray.push(a * f01 + b * f10 + c * f00);
          continue;
        }
      }

      // f(x) == f[0][0] * (1-x)(1-y) + f[1][0] * x(1-y) + f[0][1] * (1-x)y + f[1][1] * (1-x)(1-y)
      const comp1 = 1 - relativeToCellX - relativeToCellY + compositionXY; // (1-x)(1-y) == 1-x-y+xy // 0*
      const comp2 = relativeToCellX - compositionXY; // x(1-y) = x-xy // 0*
      const comp3 = relativeToCellY - compositionXY; // y(1-x) = y-xy // 0*

      resultArray.push((f00 * comp1 + // 1*
        f01 * comp2 +
        f10 * comp3 +
        f11 * compositionXY) || null);
    }

    return resultArray;
  },

  _getDeltasPreCalculatedPalettes: (palettes, spectreArrayLength = 10000) => {
    const spectreArray = [];

    const absoluteMin = +palettes[0].min;
    const absoluteMax = +palettes[palettes.length - 1].max;
    const absoluteDelta = absoluteMax - absoluteMin;
    const step = absoluteDelta / spectreArrayLength;

    let value = absoluteMin;
    for (let i = 0; i < spectreArrayLength; i++) {
      value += step;
      for (let j = 0; j < palettes.length; j++) {
        const currentPalette = palettes[j];
        if (value >= currentPalette.min && value < currentPalette.max) {
          const valueDelta = value - currentPalette.min;
          const deltaCoefficient = valueDelta / currentPalette.delta;

          const r = currentPalette.redStart + Math.round(currentPalette.redDelta * deltaCoefficient);
          const g = currentPalette.greenStart + Math.round(currentPalette.greenDelta * deltaCoefficient);
          const b = currentPalette.blueStart + Math.round(currentPalette.blueDelta * deltaCoefficient);

          spectreArray.push({r, g, b});
        }
      }
    }
    const absoluteMinValue = spectreArray[0];
    const absoluteMaxValue = spectreArray[spectreArrayLength - 1];
    return {
      spectreArray,
      absoluteMin,
      absoluteMinValue,
      absoluteMax,
      absoluteMaxValue,
      deltaCoefficient: spectreArrayLength / absoluteDelta,
    }
  },

  _getPixelColor: (value, i) => {
    if (value === null) return {r: 255, g: 255, b: 255};
    if (value <= i.deltasPalette[0].min) return {
      r: i.deltasPalette[0].redStart,
      g: i.deltasPalette[0].greenStart,
      b: i.deltasPalette[0].blueStart
    };
    const lastDeltasPalette = i.deltasPalette[i.deltasPalette.length - 1];
    if (value >= lastDeltasPalette.max) return {
      r: lastDeltasPalette.redStart + lastDeltasPalette.redDelta,
      g: lastDeltasPalette.greenStart + lastDeltasPalette.greenDelta,
      b: lastDeltasPalette.blueStart + lastDeltasPalette.blueDelta
    };
    for (let delta of i.deltasPalette) {
      if (value >= delta.min && value < delta.max) {
        return {
          r: delta.redStart,
          g: delta.greenStart,
          b: delta.blueStart
        }
      }
    }
    return {r: 255, g: 255, b: 255};
  },

  _getPixelColorInterpolated: (value, i) => {
    if (value === null) return {r: 255, g: 255, b: 255};
    if (value <= i.preCalculatedSpectre.absoluteMin) return i.preCalculatedSpectre.absoluteMinValue;
    if (value >= i.preCalculatedSpectre.absoluteMax) return i.preCalculatedSpectre.absoluteMaxValue;
    const valueDelta = value - i.preCalculatedSpectre.absoluteMin;
    const spectreIndex = Math.floor(valueDelta * i.preCalculatedSpectre.deltaCoefficient);
    return i.preCalculatedSpectre.spectreArray[spectreIndex];
  },

  draw: (i, options) => {
    /** @type CanvasRenderingContext2D */
    const context = options.context;
    const canvas = options.canvas;

    if (!_.isEqual(i.palette[0].level, i.lastUsedPalette[0].level)) {
      i.deltasPalette = field._getDeltasPalette(field._getRgbPaletteFromHex(i.palette[0].level));
      i.preCalculatedSpectre = field._getDeltasPreCalculatedPalettes(i.deltasPalette);
    }
    i.lastUsedPalette = _.cloneDeep(i.palette);

    const width = canvas.width;
    const height = canvas.height;
    const imageData = context.createImageData(width, height);

    let pixelIndex = 0;
    for (let dy = 0; dy < height; dy++) {
      const arrayX = [];
      const y = options.pointToMap({x: 0, y: dy}).y;

      for (let dx = 0; dx < width; dx++) {
        const x = options.pointToMap({x: dx,y: 0}).x;
        arrayX.push(x);
      }

      const valuesArray = field._getInterpolatedArrayValues(i, arrayX, y);
      for (let value of valuesArray) {
        if (value === null || value === undefined || isNaN(value)) {
          pixelIndex += 4;
          continue;
        }
        const pixelColor = i.palette[0].interpolated === '-1'
          ? field._getPixelColorInterpolated(value, i)
          : field._getPixelColor(value, i);

        imageData.data[pixelIndex++] = pixelColor.r;
        imageData.data[pixelIndex++] = pixelColor.g;
        imageData.data[pixelIndex++] = pixelColor.b;
        imageData.data[pixelIndex++] = 255;
      }
    }
    context.putImageData(imageData, 0, 0);
  },

  _parseSourceRenderData: (stringData) => {
    // parse string "n*50 123.123 132.323 ..." to an array (n*50 is equal to repeating null 50 times)
    let data = stringData.split(" ");
    let ret = [];
    for (let i = 0; i < data.length; i++) {
      let val = data[i];
      let starIndex = val.indexOf("*");
      if (starIndex === -1) {
        ret.push(+val);
      } else {
        let arr = val.split("*");
        let valToPush = (arr[0] === "n") ? null : (+arr[0]);
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
      let hexColorsArr = _.chunk(item.color.slice(1).split(''), 2).map((i) => i.join(""));
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
        return acc.concat({
          min: item.value,
          max: arr[index + 1].value,
          delta: arr[index + 1].value - item.value,
          redStart: item.red,
          greenStart: item.green,
          blueStart: item.blue,
          redDelta: arr[index + 1].red - item.red,
          greenDelta: arr[index + 1].green - item.green,
          blueDelta: arr[index + 1].blue - item.blue
        });
      }
      return acc;
    }, []);
  }
});

var polyline = declareType('polyline', {
  borderStyles: ['Solid', 'Dash', 'Dot', 'DashDot', 'DashDotDot', 'Clear'],

  styleShapes: {
    Solid: [],
    Dash: [5, 1],
    Dot: [1, 1],
    DashDot: [5, 1, 1, 1],
    DashDotDot: [5, 1, 1, 1, 1, 1],
    Clear: [],
  },

  bkcolor: function (i) {
    let color = i.fillbkcolor === 'background' ? '#ffffff' : i.fillbkcolor;
    if (i.selected) {
      const [red, green, blue] = parseColor(color).rgb;
      const stepValue = 50;

      if (red < 255 - stepValue) {
        color = 'rgba(' + (red + stepValue) + ',' + green + ',' + blue + ',1)';
      } else if ((green > stepValue - 1) && (blue > stepValue - 1)) {
        color = 'rgba(' + red + ',' + (green - stepValue) + ',' + (blue - stepValue) + ',1)';
      } else {
        const greenMax = Math.max(green - stepValue, 0);
        const blueMax = Math.max(blue - stepValue, 0);
        color = 'rgba(255,' + greenMax + ',' + blueMax + ',1)';
      }
    }
    return color;
  },

  bound: (p) => {
    if (p.bounds) return p.bounds;
    if (!p.arcs) return undefined;

    const bounds = {
      max: {x: undefined, y: undefined},
      min: {x: undefined, y: undefined},
    };

    p.arcs.forEach((arc) => {
      arc.path.forEach((coordinate, i) => {
        i % 2 === 0
          ? checkBoundX(bounds, coordinate)
          : checkBoundY(bounds, coordinate);
      });
    });
    return bounds;
  },

  loaded: (i) => {
    if (i.fillname) {
      const backColor = i.transparent ? 'none' : polyline.bkcolor(i);
      i.fillStyle = fillPatterns.createFillStyle(i.fillname, i.fillcolor, backColor);
    }
    if (i.borderstyleid) i.style = linesDefStub[i.borderstyleid];
  },

  points: function (i, options) {
    /** @type CanvasRenderingContext2D */
    const context = options.context;
    const addWidth = 2.5 / 96.0 * 25.4;

    for (const arc of i.arcs) {
      for (let i = 0; i < arc.path.length; i += 2) {
        context.beginPath();
        const p = options.pointToControl({x: arc.path[i], y: arc.path[i + 1]});

        if (i === 0) {
          context.fillStyle = '#000000';
          context.arc(p.x, p.y, context.lineWidth / 2 + addWidth * 3, 0, twoPi);
          context.fill();
        } else {
          context.fillStyle = '#808080';
          context.arc(p.x, p.y, context.lineWidth / 2 + addWidth * 2, 0, twoPi);
          context.fill();
          context.fillStyle = '#ffffff';
          context.beginPath();
          context.arc(p.x, p.y, context.lineWidth / 2 + addWidth, 0, twoPi);
          context.fill();
        }
      }
    }
  },

  path: function (i, options) {
    /** @type CanvasRenderingContext2D */
    const context = options.context;
    context.beginPath();

    let f;
    for (const arc of i.arcs) {
      let start = true;
      let x = null;
      for (const coordinate of arc.path) {
        if (x == null) {
          x = coordinate;
        } else {
          const p = options.pointToControl({x, y: coordinate});
          if (start) {
            context.moveTo(p.x, p.y);
            f = p;
            start = false;
          } else context.lineTo(p.x, p.y);
          x = null;
        }
      }
      if (arc.closed && i.arcs.length > 1 && f != null) context.lineTo(f.x, f.y);
    }
    if (i.arcs.length === 1 && i.arcs[0].closed) context.closePath();
  },

  decorationPath: function (i, options, lineConfig) {
    /** @type CanvasRenderingContext2D */
    const context = options.context;
    context.beginPath();

    var fillSegmentWithDecoration = function (ctx, lineConfig, point, lpoint, overhead, i, options) {
      const scale = options.pixelRatio;
      const decorations = lineConfig.Decoration;

      if (!decorations) {
        overhead = null;
        return;
      }

      for (var k = decorations.length - 1; k >= 0; k--) {
        var decoration = decorations[k];

        if (decoration.thickness) {
          ctx.lineWidth = scale * decoration.thickness._value *
            (i.style?.baseThickness ?? (i.borderwidth || defaultLineWidth)) *
            0.001 *
            options.dotsPerMeter;  // Thickness
        } else {
          ctx.lineWidth = scale * (i.style?.baseThickness ?? (i.borderwidth || defaultLineWidth)) * 0.001 * options.dotsPerMeter;
        }
        if (decoration.color)
          ctx.strokeStyle = decoration.color._value;

        var offx = decoration.offsetX._value * scale;
        var offy = decoration.offsetY._value * scale;

        var shape = decoration.Shape[0];
        var lines = shape.Line;

        var l = 0;
        var interval = decoration.interval._value * scale;
        if (!overhead[k] || overhead[k] === 0) {
          l = decoration.initialInterval._value * scale;
        } else {
          l = overhead[k];
        }

        // calculate the angle of the main line
        var dx = point.x - lpoint.x;
        var dy = point.y - lpoint.y;
        var mainAngle = Math.atan2(dy, dx);
        // ---
        // calculate the length of the line
        var lineLength = Math.sqrt(dx * dx + dy * dy);
        // ---

        while (l < lineLength && interval > 0) {
          // calculate the start point for decoration
          // (overlay i over the line, get last point)
          dx = l;
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

          l += interval;
        }
        // If we have a line length of 10 and decoration interval of 3,
        // then the overhead will be 10 - 3*4 = 2. The next decoration
        // will start at 2 pixels.
        // If no decorations were drawn, but the overhead exists, then
        // it will be gradually lowered to draw at least one decoration
        // at successive small sections.
        if (overhead[k] === l) {
          overhead[k] -= lineLength;
        } else {
          overhead[k] = l - lineLength;
        }
      }

      // finalize
      //return i - lineLength;
      return overhead;
    };

    var lastPoint = null;
    var overhead = [];

    var f;
    for (var a of i.arcs) {
      var start = true;
      var x = null;
      for (var c of a.path) {
        if (x == null)
          x = c;
        else {
          var p = options.pointToControl({x, y: c});
          if (start) {
            context.moveTo(p.x, p.y);
            f = p;
            start = false;
          } else {
            overhead = fillSegmentWithDecoration(context, lineConfig, p, lastPoint, overhead, i, options);
          }
          lastPoint = p;
          x = null;
        }
      }
      if (a.closed && i.arcs.length > 1 && f != null) {
        let s = options.pointToControl({x: a.path[0], y: a.path[1]});
        overhead = fillSegmentWithDecoration(context, lineConfig, s, f, overhead, i, options);
      }
    }
    if (i.arcs.length === 1 && i.arcs[0].closed) {
      let s = options.pointToControl({x: i.arcs[0].path[0], y: i.arcs[0].path[1]});
      let fi = options.pointToControl({
        x: i.arcs[0].path[i.arcs[0].path.length - 2],
        y: i.arcs[0].path[i.arcs[0].path.length - 1]
      });
      fillSegmentWithDecoration(context, lineConfig, s, fi, overhead, i, options);
      context.closePath();
    }
  },

  draft: function (i, options) {
    /** @type CanvasRenderingContext2D */
    const context = options.context;
    const configThicknessCoefficient = options.pixelRatio;
    const linesConfig = options.provider.lineConfig.BorderStyles[0].Element;

    let currentLineConfig = [];
    if (i.borderstyleid) {
      currentLineConfig = [linesConfig.find(e => e.guid._value === i.borderstyleid)];
    }
    if (currentLineConfig.length !== 0) {
      i.style = currentLineConfig[0];
    }

    if (i.isTrace) {
      context.lineCap = 'round';
      context.lineJoin = 'round';
    }

    polyline.path(i, options);
    context.strokeStyle = i.bordercolor || i.fillcolor || i.fillbkcolor || "#000000";
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

    if (i.style) {
      context.strokeStyle = i.style.baseColor ? i.style.baseColor._value : 'black';
      if (i.style.baseThickness)
        context.lineWidth = i.style.baseThickness._value * (i.borderwidth || defaultLineWidth) * 0.001 * options.dotsPerMeter;
      else
        context.lineWidth = (i.borderwidth || defaultLineWidth) * 0.001 * options.dotsPerMeter;
    }

    context.stroke();
    if (context.setLineDash) {
      context.setLineDash([])
    }
    if (i.arcs[0].path.length === 2) polyline.points(i, options);
  },

  draw: async (i, options) => {
    // Thickness coefficient for all lines defined in lines.json/xml
    const configThicknessCoefficient = options.pixelRatio;
    /** @type CanvasRenderingContext2D */
    const context = options.context;
    const linesConfig = options.provider.lineConfig.BorderStyles[0].Element;

    let currentLineConfig = [];
    if (i.borderstyleid) {
      currentLineConfig = [linesConfig.find(e => e.guid._value === i.borderstyleid)];
    }
    if (currentLineConfig.length !== 0) {
      i.style = currentLineConfig[0];
    }
    const pathNeeded = _.once(() => polyline.path(i, options));

    if (i.isTrace) {
      context.lineCap = 'round';
      context.lineJoin = 'round';
    }
    if ((!i.edited) && i.selected) {
      context.lineCap = 'round';
      context.lineJoin = 'round';
      pathNeeded();
      context.strokeStyle = '#000000';
      context.lineWidth = ((i.borderwidth || defaultLineWidth) + 4.5 / 96.0 * 25.4) * 0.001 * options.dotsPerMeter;
      context.stroke();
      context.strokeStyle = '#ffffff';
      context.lineWidth = ((i.borderwidth || defaultLineWidth) + 3 / 96.0 * 25.4) * 0.001 * options.dotsPerMeter;
      context.stroke();
      context.lineCap = 'butt';
    }

    if (i.fillStyle) {
      pathNeeded();
      context.fillStyle = i.fillStyle;
      context.fill();
    } else if (!i.transparent) {
      pathNeeded();
      context.fillStyle = polyline.bkcolor(i);
      context.fill();
    }
    if (!i.bordercolor || i.bordercolor === 'none') {
      if (i.edited) polyline.points(i, options);
      return;
    }
    let borderStyle = polyline.borderStyles[i.borderstyle];
    if (borderStyle === 'Clear') {
      if (i.edited) polyline.points(i, options);
      return;
    }
    pathNeeded();
    context.strokeStyle = i.bordercolor;
    context.lineWidth = (i.borderwidth || defaultLineWidth) * 0.001 * options.dotsPerMeter;

    // if a default style is present, set dash
    if (i.borderstyle !== undefined && i.borderstyle != null) {
      const baseThicknessCoefficient = Math.round((i.borderwidth || defaultLineWidth) / defaultLineWidth);
      const dash = polyline.styleShapes[polyline.borderStyles[i.borderstyle]].slice();
      for (let j = dash.length - 1; j >= 0; j--) {
        dash[j] = dash[j] * configThicknessCoefficient * baseThicknessCoefficient;
      }
      if (context.setLineDash) context.setLineDash(dash);
    }

    if (i.style) {
      context.strokeStyle = i.style.baseColor ? i.style.baseColor._value : i.bordercolor;
      if (i.style.baseThickness)
        context.lineWidth = configThicknessCoefficient * i.style.baseThickness._value * defaultLineWidth * 0.001 * options.dotsPerMeter;  // Thickness
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
    context.stroke();
    if (context.setLineDash) context.setLineDash([]);

    if (i.style) {
      const decorationPathNeeded = _.once(() => polyline.decorationPath(i, options, i.style));
      decorationPathNeeded();
      context.stroke();
      if (context.setLineDash) context.setLineDash([]);
    }
    if (i.edited || i.arcs[0].path.length === 2) polyline.points(i, options);
  }
});

var label = declareType('label', {
  alHorLeft: 0,   // horizontal alignment: left
  alHorCenter: 1, // horizontal alignment: center
  alHorRight: 2,  // horizontal alignment: right
  alVerBottom: 0, // vertical   alignment: bottom
  alVerCenter: 1, // vertical   alignment: center
  alVerTop: 2,    // vertical   alignment: top

  bound: pointBounds,

  /** Визуализирует смещение, положение и угол (для режима редактирования) */
  drawPattern: (ctx, anchor, point, angle) => {
    const crossRadius = 8;
    const angleRadius = 48;
    const needDrawAngle = Math.abs(angle) > Math.PI / 18;
    const needDrawOffset = Math.abs(anchor.x - point.x) > 4 || Math.abs(anchor.y - point.y) > 4;

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'black';

    // крестик в месте, где находится якорь подписи
    ctx.beginPath();
    ctx.moveTo(anchor.x - crossRadius, anchor.y);
    ctx.lineTo(anchor.x + crossRadius, anchor.y);
    ctx.moveTo(anchor.x, anchor.y - crossRadius);
    ctx.lineTo(anchor.x, anchor.y + crossRadius);
    ctx.stroke();

    // линия визуализирующая смещение и точка в конце
    if (needDrawOffset) {
      ctx.setLineDash([6, 3]);
      ctx.moveTo(anchor.x, anchor.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, twoPi);
      ctx.fill();
    }

    // визуализация угла поворота: две прямые и дуга между ними
    if (needDrawAngle) {
      ctx.beginPath();
      ctx.setLineDash([]);
      ctx.moveTo(point.x, point.y);
      ctx.lineTo(point.x + angleRadius, point.y);
      ctx.moveTo(point.x, point.y);
      ctx.lineTo(point.x + angleRadius * Math.cos(angle), point.y + angleRadius * Math.sin(angle));
      ctx.moveTo(point.x, point.y);
      ctx.arc(point.x, point.y, angleRadius / 2, 0, angle, angle < 0);
      ctx.stroke();
    }
  },

  draw: (i, options) => {
    // pt -> meters -> pixels
    const fontsize = (i.fontsize + (i.selected ? 2 : 0)) * (1 / 72 * 0.0254) * options.dotsPerMeter;
    const font = fontsize + 'px ' + i.fontname;

    if (fontsize < 2) return;

    /** @type CanvasRenderingContext2D */
    const context = options.context;
    context.beginPath();
    context.textAlign = 'left';
    context.textBaseline = 'top';
    context.font = font;

    const point = options.pointToControl(i);
    const anchor = {x: point.x, y: point.y};
    point.x += (i.xoffset || 0) * 0.001 * options.dotsPerMeter;
    point.y -= (i.yoffset || 0) * 0.001 * options.dotsPerMeter;

    const text = (x, y) => {
      const numbersArray = getLabelTextNumberArray(i.text);

      // если хотябы у одного из чисел в массиве есть индекс
      const hasIndexes = numbersArray.some(n => n.lower || n.upper);

      const indexFontCoefficient = 2 / 3;
      const indexFontSize = fontsize * indexFontCoefficient;

      // (h[lowerIndex] + h[upperIndex] - h[number]) / 2
      const indexOffset = (indexFontSize * 2 - fontsize) / 2;
      const indexFont = indexFontSize + 'px ' + i.fontname;

      // подсчет ширины текста с учетом индексов
      let width = 0;
      if (hasIndexes) {
        for (let j = 0; j < numbersArray.length; j++) {
          width += context.measureText(numbersArray[j].value).width;

          // считаем ширину индексов с учетом размера шрифта, если есть оба индекса то берем большую ширину
          context.font = indexFont;
          let lowerWidth = 0, upperWidth = 0;
          if (numbersArray[j].upper) upperWidth = context.measureText(numbersArray[j].upper).width;
          if (numbersArray[j].lower) lowerWidth = context.measureText(numbersArray[j].lower).width;
          context.font = font;
          width += Math.max(lowerWidth, upperWidth);
        }
      } else {
        width = context.measureText(i.text).width;
      }

      switch (i.halignment) {
        case label.alHorRight: {
          x -= width + 2;
          break;
        }
        case label.alHorCenter: {
          x -= width / 2 + 1;
          break;
        }
        default: {
        }
      }
      switch (i.valignment) {
        case label.alVerBottom: {
          y -= fontsize + 2;
          break;
        }
        case label.alVerCenter: {
          y -= fontsize / 2 + 1;
          break;
        }
        default: {
        }
      }

      const fillStyle = i.color === '#ffffff' ? 'black' : i.color;
      context.fillStyle = fillStyle;

      if (hasIndexes) {
        let newX = x;

        for (let j = 0; j < numbersArray.length; j++) {
          // отрисовка числа
          let textWidth = context.measureText(numbersArray[j].value).width;
          // отрисовка фоновой затирки
          if (!i.transparent) {
            context.fillStyle = 'white';
            context.fillRect(newX, y, textWidth, fontsize + 3);
            context.fillStyle = fillStyle;
          }
          context.fillText(numbersArray[j].value, newX, y + 1.5);
          newX += textWidth;

          const upper = numbersArray[j].upper;
          const lower = numbersArray[j].lower;

          // отрисовка верхних индексов этого числа
          let upperWidth = 0;
          if (upper) {
            const upperY = y - indexOffset;
            context.font = indexFont;
            upperWidth = context.measureText(upper).width;
            // отрисовка фоновой затирки
            if (!i.transparent) {
              context.fillStyle = 'white';
              context.fillRect(newX, upperY - 1, upperWidth, indexFontSize + 2);
              context.fillStyle = fillStyle;
            }
            context.fillStyle = fillStyle;
            context.fillText(upper, newX, upperY);
            context.font = font;
          }

          // отрисовка нижних индексов этого числа
          let lowerWidth = 0;
          if (lower) {
            const lowerY = y + fontsize + indexOffset - indexFontSize;
            context.font = indexFont;
            lowerWidth = context.measureText(lower).width;
            // отрисовка фоновой затирки
            if (!i.transparent) {
              context.fillStyle = 'white';
              context.fillRect(newX, lowerY - 1, lowerWidth, indexFontSize + 2);
              context.fillStyle = fillStyle;
            }
            context.fillText(lower, newX, lowerY);
            context.font = font;
          }

          newX += Math.max(lowerWidth, upperWidth);
        }
      } else {
        if (!i.transparent) {
          context.fillStyle = 'white';
          context.fillRect(x, y, width, fontsize + 3);
          context.fillStyle = fillStyle;
        }
        context.fillText(i.text, x, y + 1.5);
      }

      if (i.selected) {
        context.strokeStyle = 'black';
        context.lineWidth = 3;
        context.strokeRect(x, y, width, fontsize + 3);
      }
    };

    const angle = -(i.angle ?? 0) / 180 * Math.PI;
    if (i.angle) {
      context.save();
      context.translate(point.x, point.y);
      context.rotate(angle);
      text(0, 0);
      context.restore();
    } else {
      text(point.x, point.y);
    }
    if (i.edited) label.drawPattern(context, anchor, point, angle);
  },
});

declareType('pieslice', {
  bound: pointBounds,
  draw: (i, options) => {
    const context = options.context;
    const maxRadius = 16;
    const minRadius = 2;
    const p = options.pointToControl(i);
    const customIncreaseCoefficient = 1.5;

    if (i.radius > maxRadius) i.radius = maxRadius;
    if (i.radius < minRadius) i.radius = minRadius;
    const r = i.radius * 0.001 * options.dotsPerMeter * customIncreaseCoefficient;
    context.beginPath();
    if (!(i.startangle === 0 && Math.abs(i.endangle - twoPi) < 1e-6)) context.moveTo(p.x, p.y);
    context.arc(p.x, p.y, r, i.startangle + Math.PI / 2, i.endangle + Math.PI / 2, false);
    context.closePath();
    const drawOptions = options.provider.drawOptions || {};
    context.strokeStyle = (drawOptions.piesliceBorderColor || 'black');
    context.lineWidth = (drawOptions.piesliceBorderWidth || 0.2) * 0.001 * options.dotsPerMeter;
    const gradient = context.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
    gradient.addColorStop(0, 'white');
    gradient.addColorStop(1, i.color);
    context.fillStyle = gradient; // i.color
    context.globalAlpha = drawOptions.piesliceAlpha || 0.7;
    context.fill();
    context.globalAlpha = 1;
    context.stroke();
  },
});

/**
 * @param canvas {MapCanvas}
 * @param map {MapData}
 * @param options {any}
 * */
export async function startPaint(canvas, map, options) {
  // to stop painting set the options.check callback and
  // throw an exception inside it.
  // options.check may return a Promise ( or Thenable ) to pause drawing

  const coords = options.coords;
  const onCheckExecution = options.onCheckExecution;

  const exactBounds = rects.joinPoints(
    coords.pointToMap({x: 0, y: 0}),
    coords.pointToMap({x: canvas.width, y: canvas.height})
  );
  const drawBounds = rects.inflate(exactBounds, 0.1 * Math.max(
    exactBounds.max.x - exactBounds.min.x,
    exactBounds.max.y - exactBounds.min.y
  ));

  const drawOptions = {
    canvas: canvas,
    context: canvas.getContext('2d'),
    provider: provider,
    pointToControl: coords.pointToControl,
    pointToMap: coords.pointToMap,
    dotsPerMeter: coords.cscale,
    pixelRatio: options.pixelRatio,
  };

  try {
    for (const layer of map.layers) {
      if (!layer.visible) continue;
      if (!coords.scaleVisible(layer)) continue;
      if (!rects.intersects(drawBounds, layer.bounds)) continue;

      let c = onCheckExecution();
      c && (await c);

      if (!layer.elements || layer.elements.length === 0) continue;

      // отрисовка всех элементов
      for (const element of layer.elements) {
        let D = types[element.type];
        if (!rects.intersects(drawBounds, D.bound(element))) continue;

        c = onCheckExecution();
        c && (await c);

        if (D.draw && !options.draftDrawing) {
          await D.draw(element, drawOptions);
        } else if (D.draft) {
          D.draft(element, drawOptions);
        }
      }
    }

    map.x = options.events.centerx;
    map.y = options.events.centery;
    map.scale = options.events.scale;
    map.onDrawEnd(canvas, map.x, map.y, map.scale);
  } catch {
    // ...
  }
}
