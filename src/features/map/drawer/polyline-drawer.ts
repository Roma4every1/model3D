import { once } from 'lodash';
import { rgb } from 'd3-color';
import lines from './lines.json';


const defaultLineWidth = 0.23;
const borderStyles = ['Solid', 'Dash', 'Dot', 'DashDot', 'DashDotDot', 'Clear'];

const styleShapes = {
  Solid: [],
  Dash: [5, 1],
  Dot: [1, 1],
  DashDot: [5, 1, 1, 1],
  DashDotDot: [5, 1, 1, 1, 1, 1],
  Clear: [],
};

export class PolylineDrawer implements MapElementDrawer<MapPolyline> {
  public draw(i: MapPolyline, options: MapDrawOptions): void {
    const configThicknessCoefficient = window.devicePixelRatio;
    const ctx = options.ctx;

    if (i.borderstyleid) {
      i.style = lines.find(e => e.guid === i.borderstyleid);
    }
    const pathNeeded = once(() => this.path(i, options));

    if ((!i.edited) && i.selected) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      pathNeeded();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = ((i.borderwidth || defaultLineWidth) + 4.5 / 96.0 * 25.4) * 0.001 * options.dotsPerMeter;
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = ((i.borderwidth || defaultLineWidth) + 3 / 96.0 * 25.4) * 0.001 * options.dotsPerMeter;
      ctx.stroke();
      ctx.lineCap = 'butt';
    }

    if (i.fillStyle) {
      pathNeeded();
      ctx.fillStyle = i.fillStyle;
      ctx.fill('evenodd');
    } else if (!i.transparent) {
      pathNeeded();
      ctx.fillStyle = this.bkcolor(i);
      ctx.fill('evenodd');
    }
    if (!i.bordercolor || i.bordercolor === 'none') {
      if (i.edited) this.points(i, options);
      return;
    }
    let borderStyle = borderStyles[i.borderstyle];
    if (borderStyle === 'Clear') {
      if (i.edited) this.points(i, options);
      return;
    }
    pathNeeded();
    ctx.strokeStyle = i.bordercolor;
    ctx.lineWidth = (i.borderwidth || defaultLineWidth) * 0.001 * options.dotsPerMeter;

    // if a default style is present, set dash
    if (i.borderstyle !== undefined && i.borderstyle != null) {
      const baseThicknessCoefficient = Math.round((i.borderwidth || defaultLineWidth) / defaultLineWidth);
      const dash = styleShapes[borderStyles[i.borderstyle]].slice();
      for (let j = dash.length - 1; j >= 0; j--) {
        dash[j] = dash[j] * configThicknessCoefficient * baseThicknessCoefficient;
      }
      ctx.setLineDash(dash);
    }

    if (i.style) {
      ctx.strokeStyle = i.style.baseColor ? i.style.baseColor : i.bordercolor;
      if (i.style.baseThickness !== undefined) {
        ctx.lineWidth = configThicknessCoefficient * i.style.baseThickness * defaultLineWidth * 0.001 * options.dotsPerMeter;  // Thickness
      } else {
        ctx.lineWidth = configThicknessCoefficient * (i.borderwidth || defaultLineWidth) * 0.001 * options.dotsPerMeter;
      }
      if (i.style.strokeDashArray) {
        const dashObj = i.style.strokeDashArray;
        if (dashObj.onBase) {
          const dashes = dashObj.data.split(' ').map(Number);
          for (let j = dashes.length - 1; j >= 0; j--) {
            dashes[j] = dashes[j] * configThicknessCoefficient;
          }
          ctx.setLineDash(dashes);
          if (dashObj.color) ctx.strokeStyle = dashObj.color;
        }
      }
    }
    ctx.stroke();
    ctx.setLineDash([]);

    if (i.style) {
      const decorationPathNeeded = once(() => this.decorationPath(i, options, i.style));
      decorationPathNeeded();
      ctx.stroke();
      ctx.setLineDash([]);
    }
    if (i.edited || i.arcs[0].path.length === 2) this.points(i, options);
  }

  public draft(i: MapPolyline, options: MapDrawOptions): void {
    const ctx = options.ctx;
    const configThicknessCoefficient = window.devicePixelRatio;
    const linesConfig = lines;

    let currentLineConfig = [];
    if (i.borderstyleid) {
      currentLineConfig = [linesConfig.find(e => e.guid === i.borderstyleid)];
    }
    if (currentLineConfig.length !== 0) {
      i.style = currentLineConfig[0];
    }

    this.path(i, options);
    ctx.strokeStyle = i.bordercolor || i.fillcolor || i.fillbkcolor || '#000000';
    ctx.lineWidth = (i.borderwidth || defaultLineWidth) * 0.001 * options.dotsPerMeter;

    // if a default style is present, set dash
    if (i.borderstyle !== undefined && i.borderstyle != null) {
      let baseThicknessCoefficient = Math.round(i.borderwidth / defaultLineWidth);
      let dash = styleShapes[borderStyles[i.borderstyle]].slice();
      for (let j = dash.length - 1; j >= 0; j--) {
        dash[j] = dash[j] * configThicknessCoefficient * baseThicknessCoefficient;
      }
      ctx.setLineDash(dash);
    }

    if (i.style) {
      ctx.strokeStyle = i.style.baseColor ? i.style.baseColor : 'black';
      if (i.style.baseThickness !== undefined) {
        ctx.lineWidth = i.style.baseThickness * (i.borderwidth || defaultLineWidth) * 0.001 * options.dotsPerMeter;
      } else {
        ctx.lineWidth = (i.borderwidth || defaultLineWidth) * 0.001 * options.dotsPerMeter;
      }
    }
    ctx.stroke();
    ctx.setLineDash([]);
    if (i.arcs[0].path.length === 2) this.points(i, options);
  }

  public bkcolor(p: MapPolyline): ColorString {
    let color = p.fillbkcolor === 'background' ? '#ffffff' : p.fillbkcolor;
    if (p.selected) {
      const { r: red, g: green, b: blue } = rgb(color);
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
  }

  private path(i: MapPolyline, options: MapDrawOptions): void {
    const ctx = options.ctx;
    ctx.beginPath();

    let f: Point;
    for (const arc of i.arcs) {
      let start = true;
      let x = null;
      for (const coordinate of arc.path) {
        if (x == null) {
          x = coordinate;
        } else {
          const p = options.toCanvasPoint({x, y: coordinate});
          if (start) {
            ctx.moveTo(p.x, p.y);
            f = p;
            start = false;
          } else {
            ctx.lineTo(p.x, p.y);
          }
          x = null;
        }
      }
      if (arc.closed && i.arcs.length > 1 && f != null) ctx.lineTo(f.x, f.y);
    }
    if (i.arcs.length === 1 && i.arcs[0].closed) ctx.closePath();
  }

  public decorationPath(i: MapPolyline, options: MapDrawOptions, lineConfig: PolylineBorderStyle): void {
    const ctx = options.ctx;
    ctx.beginPath();

    const fillSegmentWithDecoration = function (lineConfig, point: Point, lpoint: Point, overhead: any[], i: MapPolyline) {
      const scale = window.devicePixelRatio;
      const decorations = lineConfig.Decoration;
      if (!decorations) { overhead = null; return; }

      for (let k = decorations.length - 1; k >= 0; k--) {
        const decoration = decorations[k];
        if (decoration.color) ctx.strokeStyle = decoration.color;

        ctx.lineWidth =
          (decoration.thickness ?? 1) *
          (i.style?.baseThickness ?? i.borderwidth ?? defaultLineWidth) * scale;

        let offx = decoration.offsetX * scale;
        let offy = decoration.offsetY * scale;

        const lines = decoration.Shape.Line;
        let l = 0;
        let interval = decoration.interval * scale;
        if (!overhead[k] || overhead[k] === 0) {
          l = decoration.initialInterval * scale;
        } else {
          l = overhead[k];
        }

        // calculate the angle of the main line
        let dx = point.x - lpoint.x;
        let dy = point.y - lpoint.y;
        const mainAngle = Math.atan2(dy, dx);
        const lineLength = Math.sqrt(dx * dx + dy * dy);

        while (l < lineLength && interval > 0) {
          // calculate the start point for decoration
          // (overlay i over the line, get last point)
          dx = l;
          dy = 0;
          let _dx = dx * Math.cos(mainAngle) - dy * Math.sin(mainAngle);
          let _dy = dx * Math.sin(mainAngle) + dy * Math.cos(mainAngle);
          const xTemp = _dx + lpoint.x;
          const yTemp = _dy + lpoint.y;

          for (let j = lines.length - 1; j >= 0; j--) {
            const line = lines[j];
            const x1 = line.x1 * scale + xTemp + offx;
            const y1 = line.y1 * scale + yTemp + offy;
            const x2 = line.x2 * scale + xTemp + offx;
            const y2 = line.y2 * scale + yTemp + offy;
            const decorationAngle = mainAngle - Math.PI / 2;

            dx = x1 - xTemp;
            dy = y1 - yTemp;
            _dx = dx * Math.cos(decorationAngle) - dy * Math.sin(decorationAngle);
            _dy = dx * Math.sin(decorationAngle) + dy * Math.cos(decorationAngle);
            ctx.moveTo(_dx + xTemp, _dy + yTemp);

            dx = x2 - xTemp;
            dy = y2 - yTemp;
            _dx = dx * Math.cos(decorationAngle) - dy * Math.sin(decorationAngle);
            _dy = dx * Math.sin(decorationAngle) + dy * Math.cos(decorationAngle);
            ctx.lineTo(_dx + xTemp, _dy + yTemp);
          }
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
      return overhead;
    };

    let overhead = [];
    let f: Point;
    let lastPoint: Point = null;

    for (const a of i.arcs) {
      let start = true;
      let x = null;
      for (const c of a.path) {
        if (x == null) {
          x = c;
        } else {
          const p = options.toCanvasPoint({x, y: c});
          if (start) {
            ctx.moveTo(p.x, p.y);
            f = p;
            start = false;
          } else {
            overhead = fillSegmentWithDecoration(lineConfig, p, lastPoint, overhead, i);
          }
          lastPoint = p;
          x = null;
        }
      }
      if (a.closed && i.arcs.length > 1 && f != null) {
        let s = options.toCanvasPoint({x: a.path[0], y: a.path[1]});
        overhead = fillSegmentWithDecoration(lineConfig, s, f, overhead, i);
      }
    }
    if (i.arcs.length === 1 && i.arcs[0].closed) {
      let s = options.toCanvasPoint({x: i.arcs[0].path[0], y: i.arcs[0].path[1]});
      let fi = options.toCanvasPoint({
        x: i.arcs[0].path[i.arcs[0].path.length - 2],
        y: i.arcs[0].path[i.arcs[0].path.length - 1]
      });
      fillSegmentWithDecoration(lineConfig, s, fi, overhead, i);
      ctx.closePath();
    }
  }

  private points(p: MapPolyline, options: MapDrawOptions): void {
    const twoPi = 2 * Math.PI;
    const addWidth = 2.5 / 96.0 * 25.4;
    const ctx = options.ctx;

    for (const arc of p.arcs) {
      for (let i = 0; i < arc.path.length; i += 2) {
        ctx.beginPath();
        const p = options.toCanvasPoint({x: arc.path[i], y: arc.path[i + 1]});

        if (i === 0) {
          ctx.fillStyle = '#000000';
          ctx.arc(p.x, p.y, ctx.lineWidth / 2 + addWidth * 3, 0, twoPi);
          ctx.fill();
        } else {
          ctx.fillStyle = '#808080';
          ctx.arc(p.x, p.y, ctx.lineWidth / 2 + addWidth * 2, 0, twoPi);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(p.x, p.y, ctx.lineWidth / 2 + addWidth, 0, twoPi);
          ctx.fill();
        }
      }
    }
  }
}
