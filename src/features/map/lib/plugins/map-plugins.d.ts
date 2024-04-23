/** Плагин карты. */
interface IMapPlugin {
  /** Название плагина. */
  name: string;
  /** Активен ли режим инклинометрии. */
  inclinometryModeOn: boolean;

  /** Устанавливает данные плагина. */
  setData(channels: ChannelDict, param?: Parameter): void;
  /** Устанавливает canvas и контекст отрисовки для плагина. */
  setCanvas(canvas: MapCanvas): void;
  /** Отрисовка элементов плагина. */
  render(): void;
}
