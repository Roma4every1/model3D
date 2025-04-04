import type { MapExtraObjectProvider } from './types';
import { calcCentroid } from 'shared/lib';
import { getPointBounds } from '../lib/bounds';


/** Состояние измерителя длин и углов. */
export interface MeasurerState {
  /** Опорные точки и их метаданные. */
  nodes: MeasurerNode[];
  /** Площадь образованной фигуры. */
  area: number;
  /** Общая длина отрезков. */
  totalLength: number;
  /** Угол между последним и первым отрезками. */
  firstAngle?: number;
}

/** Опорная точка измерителя. */
export interface MeasurerNode {
  /** Текущая точка. */
  readonly point: Readonly<Point>;
  /** Расстояние от предыдущей точки до текущей. */
  distance?: number;
  /** Начальный угол между двумя отрезками. */
  startAngle?: number;
  /** Конечный угол между двумя отрезками. */
  endAngle?: number;
}

export interface MapMeasureDrawOptions {
  /** Отображать ли расстояния между точками. */
  showDistances: boolean;
  /** Отображать ли углы между отрезками. */
  showAngles: boolean;
  /** Отображать ли площадь фигуры. */
  showArea: boolean;
  /** Отображать ли длину всей цепи. */
  showLength: boolean;
  /** Замыкать ли цепь. */
  closed: boolean;
}

const lineWidth = 2;
const lineColor = '#fa4747';
const areaBackground = '#808080';
const pointRadius = 3;
const pointColor = '#111';
const angleArcColor = '#a8a8ff';

const angleFontSize = 9;
const distanceFontSize = 10;
const labelFontSize = 10;
const textForeground = '#111';
const textBackground = '#fff';

/** Класс для отображения измерителя. */
export class MapMeasureObjectProvider implements MapExtraObjectProvider<MeasurerState> {
  public model: MeasurerState | null;
  public drawOptions: MapMeasureDrawOptions;

  constructor() {
    this.drawOptions = {
      showDistances: true, showAngles: false,
      showLength: false, showArea: false, closed: false,
    };
    this.model = null;
  }

  public setModel(payload: MeasurerState | null): void {
    this.model = payload;
  }

  public computeBounds(): Bounds {
    return getPointBounds(this.model.nodes.map(n => n.point));
  }

  public render(options: MapDrawOptions): void {
    if (!this.model) return;
    const ctx = options.ctx;
    const nodes = this.model.nodes;
    const points = nodes.map(n => options.toCanvasPoint(n.point));

    if (nodes.length === 1) {
      ctx.beginPath();
      ctx.fillStyle = pointColor;
      ctx.arc(points[0].x, points[0].y, pointRadius * window.devicePixelRatio, 0, 2 * Math.PI);
      ctx.fill();
    } else {
      const { showAngles, showDistances, showArea, showLength } = this.drawOptions;
      this.drawMain(ctx, points);
      if (showAngles) this.drawAngles(ctx, points);
      if (showDistances) this.drawDistances(ctx, points);
      this.drawPoints(ctx, points);
      if (showArea || showLength) this.drawLabels(ctx, points);
    }
  }

  private drawMain(ctx: CanvasRenderingContext2D, points: Point[]): void {
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; ++i) {
      const point = points[i];
      ctx.lineTo(point.x, point.y);
    }
    if (this.drawOptions.closed) ctx.closePath();
    ctx.stroke();
    if (this.drawOptions.showArea) {
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = areaBackground;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  private drawPoints(ctx: CanvasRenderingContext2D, points: Point[]): void {
    const r = pointRadius * window.devicePixelRatio;
    ctx.fillStyle = pointColor;

    for (const point of points) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, r, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  private drawAngles(ctx: CanvasRenderingContext2D, points: Point[]): void {
    const nodes = this.model.nodes;
    let start = 0, end = nodes.length;
    if (!this.drawOptions.closed) { ++start; --end; }

    ctx.font = (angleFontSize * window.devicePixelRatio) + 'px Roboto';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = start; i < end; ++i) {
      const node = nodes[i], point = points[i];
      this.drawAngleArc(ctx, node, point);
      this.drawAngleText(ctx, node, point);
    }
  }

  private drawAngleArc(ctx: CanvasRenderingContext2D, node: MeasurerNode, point: Point): void {
    ctx.fillStyle = angleArcColor;
    ctx.lineWidth = window.devicePixelRatio;
    ctx.globalAlpha = 0.8;

    const { startAngle, endAngle } = node;
    const { x, y } = point;
    const r = 32 * window.devicePixelRatio;

    let delta = endAngle - startAngle;
    delta = ((delta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    if (delta > Math.PI) delta -= 2 * Math.PI;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, r, startAngle, endAngle, delta < 0);
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.lineWidth = 1.5 * window.devicePixelRatio;
  }

  private drawAngleText(ctx: CanvasRenderingContext2D, node: MeasurerNode, point: Point): void {
    const { startAngle, endAngle } = node;
    let currentAngle = startAngle - endAngle;
    if (currentAngle > Math.PI) currentAngle -= 2 * Math.PI;
    if (currentAngle < -Math.PI) currentAngle += 2 * Math.PI;
    let middleAngle = currentAngle / 2 + endAngle;

    const r = 16 * window.devicePixelRatio;
    const x = point.x + r * Math.cos(middleAngle);
    const y = point.y + r * Math.sin(middleAngle);

    const text = Math.abs(Math.round(currentAngle * 180 / Math.PI)) + '°';
    const width = ctx.measureText(text).width;
    const height = angleFontSize * window.devicePixelRatio;

    const padding = 2;
    const rectWidth = width + 2 * padding;
    const rectHeight = height + 2 * padding;

    ctx.fillStyle = textBackground;
    ctx.fillRect(x - width / 2 - padding, y - height / 2 - padding, rectWidth, rectHeight);
    ctx.fillStyle = textForeground;
    ctx.fillText(text, x, y);
  }

  private drawDistances(ctx: CanvasRenderingContext2D, points: Point[]): void {
    const nodes = this.model.nodes;
    ctx.font = (distanceFontSize * window.devicePixelRatio) + 'px Roboto';
    ctx.fillStyle = textForeground;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';

    for (let i = 1; i < nodes.length; ++i) {
      this.drawDistance(ctx, points[i - 1], points[i], nodes[i].distance);
    }
    if (this.drawOptions.closed && nodes.length > 2) {
      this.drawDistance(ctx, points.at(-1), points.at(0), nodes[0].distance);
    }
  }

  private drawDistance(ctx: CanvasRenderingContext2D, p1: Point, p2: Point, d: number): void {
    const offset = 4 * window.devicePixelRatio;
    let angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    if (angle > Math.PI / 2 || angle < -Math.PI / 2) angle -= Math.PI;

    ctx.save();
    ctx.translate((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
    ctx.rotate(angle);
    ctx.fillText(formatDistance(d), 0, -offset);
    ctx.restore();
  }

  private drawLabels(ctx: CanvasRenderingContext2D, points: Point[]): void {
    let width: number;
    const height = labelFontSize * window.devicePixelRatio;
    const padding = 2;
    const { x: cx, y: cy } = calcCentroid(points);

    let total = this.model.totalLength;
    if (this.drawOptions.closed) total += this.model.nodes[0].distance ?? 0;

    ctx.font = height + 'px Roboto';
    ctx.textAlign = 'start';
    ctx.textBaseline = 'middle';

    const drawLabel = (text: string, y: number) => {
      const x = cx - width / 2;
      ctx.fillStyle = textBackground;
      ctx.fillRect(x - padding, y - height / 2 - padding, width + 2 * padding, height + 2 * padding);
      ctx.fillStyle = textForeground;
      ctx.fillText(text, x, y);
    };

    if (this.drawOptions.showLength && this.drawOptions.showArea) {
      const text1 = 'L: ' + formatDistance(total);
      const text2 = 'S: ' + formatArea(this.model.area);
      width = Math.max(ctx.measureText(text1).width, ctx.measureText(text2).width);
      const delta = (height + padding) / 2;
      drawLabel(text1, cy - delta);
      drawLabel(text2, cy + delta);
    } else {
      const text = this.drawOptions.showLength
        ? 'L: ' + formatDistance(total)
        : 'S: ' + formatArea(this.model.area);
      width = ctx.measureText(text).width;
      drawLabel(text, cy);
    }
  }
}

function formatDistance(m: number): string {
  if (m > 10000) {
    return (Math.round(m / 10) / 100) + ' км';
  } else {
    return Math.round(m) + ' м';
  }
}
function formatArea(m2: number): string {
  if (m2 > 1e5) {
    return (Math.round(m2 / 1e4) / 100) + ' км²';
  } else {
    return Math.round(m2) + ' м²';
  }
}
