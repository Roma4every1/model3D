import { groupBy } from 'lodash';
import { fixColorHEX } from 'shared/lib';
import { cellsToRecords } from 'entities/channel';


/** Плагин для вертикальной проекции инклинометрии на карте. */
export class InclinometryPlugin implements IMapPlugin {
  /** Название плагина. */
  public readonly name = 'incl';
  /** Активен ли режим инклинометрии. */
  public inclinometryModeOn: boolean;

  private readonly inclChannelID: ChannelID;
  private readonly inclVersionChannelID: ChannelID;
  private readonly inclPropertyChannelID: ChannelID;

  /** ID параметра системы, который отвечает за угол. */
  public readonly parameterID: ParameterID;
  /** Коллбэк для обновления значения угла просмотра инклинометрии. */
  public onParameterUpdate: (value: number) => void;
  /** Значение угла просмотра инклинометрии. */
  private angle: number = 0;

  /** Канвас карты. */
  private canvas: MapCanvas;
  /** Контекст карты. */
  private ctx: CanvasRenderingContext2D = null;
  /** Координата центра карты по X. */
  private centerX: number = 0;
  /** Координата центра карты по Y. */
  private centerY: number = 0;
  /** Радиус ограничевающей окружности проекции инклинометрии. */
  private readonly radius: number;

  /** Максимальное смещение инклинометрии (в координатах карты). */
  public maxShift = 0;
  /** Смещение в последней точке инклинометрии по X (в координатах канваса). */
  public mapShiftX = 0;
  /** Смещение в последней точке инклинометрии по Y (в координатах канваса). */
  public mapShiftY = 0;

  /** Данные точек инклинометрии выбранной скважины. */
  private data: ChannelRecord[] = null;
  /** Данные версий инклинометрии выбранной скважины. */
  private versions: ChannelRecord[] = null;
  /** Дополнительные данные версии инклинометрии выбранной скважины (цвета для линий). */
  private versionProperties: ChannelRecord[] = null;

  constructor(settings: any, parameters: Parameter[], channels: AttachedChannel[]) {
    this.parameterID = parameters.find(p => p.name === 'inclinometryViewAngle')?.id;
    this.radius = (+settings['@MinCircle']) / 2 * window.devicePixelRatio;
    this.inclinometryModeOn = settings['@InclinometryModeOn'] === 'true';

    this.inclChannelID = channels.find(c => c.name === 'Inclinometry')?.id;
    this.inclVersionChannelID = channels.find(c => c.name === 'InclinometryVersions')?.id;
    this.inclPropertyChannelID = channels.find(c => c.name === 'InclinometryVersionsProperties')?.id;
  }

  /** Обновляет значение угла просмотра инклинометрии по точке. */
  public handleInclinometryAngleChange(point: Point): void {
    if (!this.data?.length) return;
    const value = this.getAngleFromPoint(
      point.x / 2 * window.devicePixelRatio,
      point.y / 2 * window.devicePixelRatio,
    );
    this.canvas.events.emit('changed')
    this.onParameterUpdate(Math.round(value));
    this.render();
  }

  public setAngle(angle: number): void {
    this.angle = angle;
  }

  /** Устанавливает данные инклинометрии. */
  public setData(channels: ChannelDict): void {
    this.data = cellsToRecords(channels[this.inclChannelID]?.data);
    this.versions = cellsToRecords(channels[this.inclVersionChannelID]?.data);
    this.versionProperties = cellsToRecords(channels[this.inclPropertyChannelID]?.data);
    this.versionProperties.forEach(r => { r.COLOR = fixColorHEX(r.COLOR); })

    if (!this.data.length) return;
    const data = this.data;
    const maxShiftInclPoint = data.reduce((max, r) =>
      !max || (max['SHIFT'] < r['SHIFT']) ? r : max, null)

    this.maxShift = maxShiftInclPoint['SHIFT'];

    // перевод в координаты канваса смещений по X и Y в последней точке инклинометрии
    this.mapShiftX = maxShiftInclPoint['SHIFTY'] / this.maxShift * this.radius;
    this.mapShiftY = -maxShiftInclPoint['SHIFTX'] / this.maxShift * this.radius;
  }

  /** Устанавливает canvas и контекст отрисовки для плагина. */
  public setCanvas(canvas: MapCanvas): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.centerX = canvas.clientWidth / 2 * window.devicePixelRatio;
    this.centerY = canvas.clientHeight / 2 * window.devicePixelRatio;
  }

  /** Отрисовка элементов плагина. */
  public render(): void {
    if (!this.inclinometryModeOn) return;
    if (!this.data?.length) return;
    this.drawCircle();
    this.drawHelpText();
    this.drawInclinometryLines();
    this.drawAngleArrow(-this.angle + 90);
  }

  /** Отрисовывает линии инклинометрии. */
  private drawInclinometryLines(): void {
    const allData = this.data;
    const versions = this.versions;
    const versionsProperties = this.versionProperties;

    const maxShift = Math.max(...allData.map(r => r['SHIFT']));

    const grouped =
      groupBy(allData, r => r['INCL_HDR_ID']);

    Object.entries(grouped).reverse().forEach(([code, data]) => {
      const index = versions.findIndex(v => +v['RID'] === +code);
      const properties = versionsProperties.find(p =>
        p['CODE'] === index + 1 // первый цвет почему-то #ff000000
      );
      const color = properties ? properties['COLOR'] : null;

      this.drawLine(data, color, maxShift);
    })
  }

  /** Отрисовывает одну линию инклинометрии. */
  private drawLine(data: ChannelRecord[], color: string, maxShift: number): void {
    if (!data?.length) return;
    const ctx = this.ctx;

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5 * window.devicePixelRatio;
    ctx.moveTo(this.centerX, this.centerY);
    data.forEach(r => {
      const shiftX = r['SHIFTX'];
      const shiftY = r['SHIFTY'];

      ctx.lineTo(
        this.centerX + (shiftY / maxShift * this.radius),
        this.centerY + (-shiftX / maxShift * this.radius)
      );
    })
    ctx.stroke();
    ctx.strokeStyle = 'rgba(0,0,0,1)';
  }

  /** Отрисовывает ограничивающую линию проекции инклинометрии. */
  private drawCircle(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    ctx.beginPath();
    ctx.arc(this.centerX, this.centerY, this.radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
    ctx.fill();
    ctx.lineWidth = 2.5 * window.devicePixelRatio;
    ctx.stroke();
  }

  /** Отрисовывает управляющий элемент стрелки инклинометрии для изменения угла просмотра. */
  private drawAngleArrow(angle: number): void {
    const { x1, y1, x2, y2 } = this.calculateLineCoordinates(angle);

    const ctx = this.ctx;
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

  /** Вычисляет координаты для управляющего элемента стрелки инклинометрии. */
  private calculateLineCoordinates(angleDegrees: number) {
    const radius = this.radius;
    let x1, y1, x2, y2;
    let angleRadians = angleDegrees * Math.PI / 180;

    if (angleDegrees >= 0 && angleDegrees <= 90) {
      x2 = this.centerX + Math.cos(angleRadians) * radius;
      y2 = this.centerY - Math.sin(angleRadians) * radius;

      x1 = this.centerX - Math.cos(angleRadians) * radius;
      y1 = this.centerY + Math.sin(angleRadians) * radius;
    } else if (angleDegrees > 90 && angleDegrees <= 180) {
      angleRadians = (angleDegrees - 90) * Math.PI / 180;
      x1 = this.centerX + Math.sin(angleRadians) * radius;
      y1 = this.centerY + Math.cos(angleRadians) * radius;
      x2 = this.centerX - Math.sin(angleRadians) * radius;
      y2 = this.centerY - Math.cos(angleRadians) * radius;
    } else if (angleDegrees > 180 && angleDegrees <= 270) {
      angleRadians = (angleDegrees - 180) * Math.PI / 180;
      x2 = this.centerX - Math.cos(angleRadians) * radius;
      y2 = this.centerY + Math.sin(angleRadians) * radius;
      x1 = this.centerX + Math.cos(angleRadians) * radius;
      y1 = this.centerY - Math.sin(angleRadians) * radius;
    } else {
      angleRadians = (angleDegrees - 270) * Math.PI / 180;
      x1 = this.centerX - Math.sin(angleRadians) * radius;
      y1 = this.centerY - Math.cos(angleRadians) * radius;
      x2 = this.centerX + Math.sin(angleRadians) * radius;
      y2 = this.centerY + Math.cos(angleRadians) * radius;
    }
    return {x1, y1, x2, y2};
  }

  /** Получает угол на окружности по точке на канвасе. */
  private getAngleFromPoint(x: number, y: number): number {
    const dx = x - this.centerX;
    const dy = this.centerY - y;

    const angleRadians = Math.atan(dy/dx);
    let angleDegrees = angleRadians * 180 / Math.PI;
    if (dx < 0) angleDegrees += 180;
    angleDegrees = -angleDegrees + 90;

    return angleDegrees < 0 ? angleDegrees + 360 : angleDegrees;
  }

  /** Отрисовывает подписи углов окружности. */
  private drawHelpText(): void {
    this.ctx.font = `bold ${12 * window.devicePixelRatio}px Arial`;
    this.ctx.fillStyle = 'black';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    const offset = 15 * window.devicePixelRatio;

    const angles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    const labels = ['90', '180', '270', '0'];

    for (let i = 0; i < angles.length; i++) {
      const angle = angles[i];
      const x = this.centerX + (this.radius + offset) * Math.cos(angle);
      const y = this.centerY + (this.radius + offset) * Math.sin(angle);
      this.ctx.fillText(labels[i], x, y);
    }
  }
}
