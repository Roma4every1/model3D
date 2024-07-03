/** Плагин карты. */
interface IMapPlugin {
  /** Название плагина. */
  readonly name: string;
  /** Устанавливает данные плагина. */
  setData(channels: ChannelDict): void;
  /** Устанавливает canvas и контекст отрисовки для плагина. */
  setCanvas(canvas: MapCanvas): void;
  /** Отрисовка элементов плагина. */
  render(): void;
}
