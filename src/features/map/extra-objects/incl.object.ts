import type { MapExtraObjectProvider } from './types';
import { fixColorHEX } from 'shared/lib';
import { pixelPerMeter } from '../lib/constants';
import { MapStage } from '../lib/map-stage';


export interface InclInitData {
  dataChannel: AttachedChannel;
  propChannel: AttachedChannel;
  radius: number;
}

/** Данные для отрисовки вертикальной проекции инклинометрии. */
interface InclView {
  /** Угол просмотра инклинометрии. */
  angle: number;
  /** Точка, соответствующая скважине. */
  point: MapPoint;
  /** Смещение в последней точке инклинометрии (в координатах канваса). */
  shift: Point;
  /** Вертикальные проекции. */
  lines: InclLine[];
}
interface InclLine {
  id: number;
  points: Point[];
  color: ColorString;
}

interface InclViewPayload {
  well?: WellID;
  data?: ChannelDict;
  angle?: number;
}


/** Класс для отображения для вертикальной проекции инклинометрии. */
export class MapInclinometryProvider implements MapExtraObjectProvider<InclView, InclViewPayload> {
  /** Ссылка на сцену соответствующей карты. */
  private readonly stage: MapStage;
  /** Канал с данными инклинометрии. */
  private readonly dataChannel: AttachedChannel;
  /** Канал свойств версий инклинометрии. */
  private readonly propChannel: AttachedChannel;
  /** Хранилище ID запросов для оптимизации обработки данных. */
  private readonly queryIDs: Map<ChannelID, QueryID>;
  /** Справочник цветов кривых. */
  private readonly colorLookup: Map<number, ColorString>;
  /** Радиус окружности. */
  private readonly radius: number;

  public model: InclView = null;
  private mapPoint: MapPoint = null;
  private lines: InclLine[];
  private shift: Point;

  constructor(stage: MapStage, init: InclInitData) {
    this.stage = stage;
    this.dataChannel = init.dataChannel;
    this.propChannel = init.propChannel;
    this.queryIDs = new Map();
    this.colorLookup = new Map();
    this.radius = init.radius * window.devicePixelRatio;
  }

  public setModel({well, data, angle}: InclViewPayload): void {
    if (typeof well === 'number' && typeof angle === 'number') {
      this.model = this.updateModel(well, data, angle);
    } else {
      this.model = null;
    }
  }

  public computeBounds(): Bounds {
    const { point, shift } = this.model;
    const k = 5000 / window.devicePixelRatio / pixelPerMeter;
    const x = point.x + shift.x * k;
    const y = point.y + shift.y * k;
    return {min: {x, y}, max: {x, y}};
  }

  public computeViewport(): MapViewport {
    const scale = 5000;
    const k = scale / window.devicePixelRatio / pixelPerMeter;
    const { point, shift } = this.model;
    return {cx: point.x + shift.x * k, cy: point.y + shift.y * k, scale};
  }

  public render(options: MapDrawOptions): void {
    const point = options.toCanvasPoint(this.model.point);
    const cx = point.x + this.model.shift.x;
    const cy = point.y + this.model.shift.y;

    const ctx = options.ctx;
    this.drawCircle(ctx, cx, cy);
    this.drawHelpText(ctx, cx, cy);

    for (const { points, color } of this.model.lines) {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5 * window.devicePixelRatio;
      ctx.lineTo(cx, cy);
      for (const point of points) ctx.lineTo(cx + point.x, cy + point.y);
      ctx.stroke();
    }
    this.drawAngleArrow(ctx, cx, cy, -this.model.angle + 90);
  }

  private drawCircle(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
    ctx.beginPath();
    ctx.arc(cx, cy, this.radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
    ctx.fill();
    ctx.lineWidth = 2.5 * window.devicePixelRatio;
    ctx.stroke();
  }

  private drawHelpText(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
    ctx.font = `bold ${12 * window.devicePixelRatio}px Roboto`;
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const r = this.radius + 15 * window.devicePixelRatio;
    ctx.fillText('0', cx, cy - r);
    ctx.fillText('90', cx + r, cy);
    ctx.fillText('180', cx, cy + r);
    ctx.fillText('270', cx - r, cy);
  }

  private drawAngleArrow(ctx: CanvasRenderingContext2D, cx: number, cy: number, angle: number): void {
    const { x1, y1, x2, y2 } = this.getLine(cx, cy, angle);
    const headLength = 10 * window.devicePixelRatio;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2.5 * window.devicePixelRatio;
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.translate(x2, y2);
    ctx.rotate(Math.atan2(y2 - y1, x2 - x1));
    ctx.moveTo(0, 0);
    ctx.lineTo(-headLength, -headLength / 2);
    ctx.lineTo(-headLength, headLength / 2);
    ctx.fillStyle = '#ff0000';
    ctx.fill();
    ctx.restore();
  }

  /* --- Utils --- */

  private getLine(cx: number, cy: number, angleDegrees: number) {
    const r = this.radius;
    let angleRadians = angleDegrees * Math.PI / 180;
    let x1: number, y1: number, x2: number, y2: number;

    if (angleDegrees >= 0 && angleDegrees <= 90) {
      x2 = cx + Math.cos(angleRadians) * r;
      y2 = cy - Math.sin(angleRadians) * r;
      x1 = cx - Math.cos(angleRadians) * r;
      y1 = cy + Math.sin(angleRadians) * r;
    } else if (angleDegrees > 90 && angleDegrees <= 180) {
      angleRadians = (angleDegrees - 90) * Math.PI / 180;
      x1 = cx + Math.sin(angleRadians) * r;
      y1 = cy + Math.cos(angleRadians) * r;
      x2 = cx - Math.sin(angleRadians) * r;
      y2 = cy - Math.cos(angleRadians) * r;
    } else if (angleDegrees > 180 && angleDegrees <= 270) {
      angleRadians = (angleDegrees - 180) * Math.PI / 180;
      x2 = cx - Math.cos(angleRadians) * r;
      y2 = cy + Math.sin(angleRadians) * r;
      x1 = cx + Math.cos(angleRadians) * r;
      y1 = cy - Math.sin(angleRadians) * r;
    } else {
      angleRadians = (angleDegrees - 270) * Math.PI / 180;
      x1 = cx - Math.sin(angleRadians) * r;
      y1 = cy - Math.cos(angleRadians) * r;
      x2 = cx + Math.sin(angleRadians) * r;
      y2 = cy + Math.cos(angleRadians) * r;
    }
    return {x1, y1, x2, y2};
  }

  private updateModel(well: WellID, channels: ChannelDict, angle: number): InclView | null {
    if (this.mapPoint?.UWID !== well) {
      this.mapPoint = this.stage.getNamedPoint(well);
      if (!this.mapPoint) {
        if (this.stage.getMapData().layers.length > 0) return null;
        this.mapPoint = {UWID: well, x: 0, y: 0, name: '', attrTable: null};
      }
    }
    const data = channels[this.dataChannel.id]?.data;
    if (!data || data.rows.length === 0) return null;

    const lookupChanged = this.updateLookup(channels);
    if (this.queryIDs.get(this.dataChannel.id) !== data.queryID) {
      this.updateLines(data);
    } else if (lookupChanged) {
      this.lines.forEach(l => { l.color = this.colorLookup.get(l.id); });
    }
    return {point: this.mapPoint, shift: this.shift, lines: this.lines, angle};
  }

  private updateLines(data: ChannelData): void {
    const info = this.dataChannel.info;
    const vIndex = data.columns.findIndex(c => c.name === info.version.columnName);
    const sIndex = data.columns.findIndex(c => c.name === info.shift.columnName);
    const sxIndex = data.columns.findIndex(c => c.name === info.shiftX.columnName);
    const syIndex = data.columns.findIndex(c => c.name === info.shiftY.columnName);

    let maxShift = -Infinity;
    let maxRow: ChannelRow;

    for (const row of data.rows) {
      const shift = row[sIndex];
      if (shift > maxShift) { maxShift = shift; maxRow = row; }
    }
    this.lines = [];
    const map: Map<number, Point[]> = new Map();

    for (const row of data.rows) {
      const version = row[vIndex];
      let points = map.get(version);

      if (!points) {
        points = []; map.set(version, points);
        this.lines.push({id: version, points, color: this.colorLookup.get(version) ?? '#000'});
      }
      const sx = row[sxIndex] / maxShift * this.radius;
      const sy = -row[syIndex] / maxShift * this.radius;
      points.push({x: sx, y: sy});
    }
    const maxShiftX = -maxRow[sxIndex] / maxShift * this.radius;
    const maxShiftY = maxRow[syIndex] / maxShift * this.radius;
    this.shift = {x: maxShiftX, y: maxShiftY};
  }

  private updateLookup(channels: ChannelDict): boolean {
    const pid = this.propChannel.id;
    const pData = channels[pid]?.data;
    const vid = this.dataChannel.info.version.lookups.ids.id;
    const vData = channels[vid]?.data;

    if (!pData || !vData) {
      if (this.colorLookup.size > 0) {
        this.colorLookup.clear();
        return true;
      }
      return false;
    }
    if (this.queryIDs.get(pid) !== pData.queryID || this.queryIDs.get(vid) !== vData.queryID) {
      this.fillLookup(pData, vData);
      this.queryIDs.set(pid, pData.queryID);
      this.queryIDs.set(vid, vData.queryID);
      return true;
    }
    return false;
  }

  private fillLookup(propData: ChannelData, versionData: ChannelData): void {
    const vName = this.dataChannel.info.version.lookups.ids.info.id.columnName;
    const vIndex = versionData.columns.findIndex(c => c.name === vName);

    const lookupInfo = this.propChannel.info;
    const idIndex = propData.columns.findIndex(c => c.name === lookupInfo.id.columnName);
    const colorIndex = propData.columns.findIndex(c => c.name === lookupInfo.color.columnName);

    versionData.rows.forEach((row: ChannelRow, i: number) => {
      const pRow = propData.rows.find(r => r[idIndex] === i + 1);
      if (pRow) this.colorLookup.set(row[vIndex], fixColorHEX(pRow[colorIndex]));
    });
  }
}
