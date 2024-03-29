/** Настройки плагина инклинометрии.
 * + `minCircle` — минимальный радиус вспомогальной окружности
 * + `inclinometryModeOn` — активен ли режим инклинометрии
 * */
interface InclinometryPluginSettings {
  minCircle: number;
  inclinometryModeOn: boolean;
}

interface IInclinometryModePlugin extends IMapPlugin {
  /** Максимальное смещение инклинометрии (в координатах карты). */
  maxShift : number;
  /** Смещение в последней точке инклинометрии по X (в координатах канваса). */
  mapShiftX: number;
  /** Смещение в последней точке инклинометрии по Y (в координатах канваса). */
  mapShiftY: number;

  /** Устанавливает коллбэк для обновления значения угла просмотра инклинометрии. */
  setUpdateAngleParamFunction(callback: (value: number) => void): void;

  /** Обновляет значение угла просмотра инклинометрии по точке. */
  handleInclinometryAngleChange(point: Point): void;
}
