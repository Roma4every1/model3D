/** Данные для инициализации канала. */
export interface ChannelConfigDTO {
  /** Список свойств канала. */
  properties: ChannelPropertyDTO[];
  /** Названия параметров, необходимые для наполнения. */
  parameters?: string[];
  /** Название канала на уровне интерфейса. */
  displayName?: string;
  /** Название параметра активной записи канала. */
  currentRowObjectName?: string;
}

/** Данные для инициализации свойства канала. */
export interface ChannelPropertyDTO {
  /** Название свойства. */
  name?: string;
  /** Название колонки, на которую ссылается свойство. */
  fromColumn?: string;
  /** Имя свойства для отображения на интерфейсе. */
  displayName?: string;
  /** Путь в дереве свойств. */
  treePath?: string[];
  /** Названия каналов-справочников свойства. */
  lookupChannels?: string[];
  /** Название канала для таблицы второго уровня. */
  secondLevelChannelName?: string;
  /** Информация для свойства связанного с файлами. */
  file?: {nameFrom: string, fromResources?: boolean};
}
