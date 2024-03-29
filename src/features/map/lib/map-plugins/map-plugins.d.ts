/** Данные настроек плагинов карты. */
type PluginSettingsRaw = Record<string, string>;

/** Словарь настроек плагинов карты. */
type MapPluginsSettings = Record<string, PluginSettings>;

/** Настройки плагинов карты. */
type PluginSettings = InclinometryPluginSettings;

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
