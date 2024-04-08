/** Данные настроек плагинов карты. */
type MapPluginsSettingsDictRaw = Record<string, string>;

/** Словарь настроек плагинов карты. */
type MapPluginsSettingsDict = Record<string, MapPluginSettings>;

/** Настройки плагинов карты. */
type MapPluginSettings = InclinometryPluginSettings;

/** Настройки плагина инклинометрии.
 * + `minCircle` — минимальный радиус вспомогальной окружности
 * + `inclinometryModeOn` — активен ли режим инклинометрии
 * */
interface InclinometryPluginSettings {
  minCircle: number;
  inclinometryModeOn: boolean;
}

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
