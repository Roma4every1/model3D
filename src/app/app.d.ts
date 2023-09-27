/** Well Manager State. */
interface WState {
  /** Данные общего характера. */
  appState: AppState;
  /** Состояние корневой формы. */
  root: RootFormState;
  /** Состояния презентаций. */
  presentations: PresentationDict;
  /** Состояния форм. */
  forms: FormStates;
  /** Параметры форм. */
  parameters: ParamDict;
  /** Активные объекты. */
  objects: ObjectsState;
  /** Данные каналов. */
  channels: ChannelDict;
  /** Хранилище данных таблиц. */
  tables: TableStates;
  /** Хранилище каротажных диаграмм. */
  carats: CaratStates;
  /** Хранилище графиков. */
  charts: ChartStates;
  /** Хранилище карт. */
  maps: MapsState;
  /** Хранилище форм профиля. */
  profiles: ProfileStates;
  /** Хранилище форм просмотра файлов. */
  fileViews: FileViewStates;
  /** Хранилище форм списков файлов. */
  fileLists: FileListStates;
  /** Состояние отчётов и SQL-программ. */
  reports: Reports;
  /** Окна и диалоги. */
  windows: WindowStates;
  /** Уведомления. */
  notifications: Notifications;
  /** Состояние серверных запросов. */
  fetches: FetchesState;
}

/* --- --- --- */

/** Общие данные приложения.
 * + `config`: {@link ClientConfiguration}
 * + `systemList`: {@link SystemList}
 * + `sessionID`: {@link SessionID}
 * + `systemID`: {@link SystemID}
 * */
interface AppState {
  /** Клиентская конфигурация. */
  config: ClientConfiguration;
  /** Список систем. */
  systemList: SystemList;
  /** ID текущей системы. */
  systemID: SystemID;
  /** Состояние сессии. */
  sessionID: SessionID;
  /** ID из `setInterval` для запроса `extendSession`. */
  sessionIntervalID: number;
}

/** Клиентская конфигурация Well Manager.
 * + `devMode?: boolean`
 * + `webServicesURL: string`
 * + `root?: string`
 * */
interface ClientConfiguration {
  /** Режим разработчика. */
  devMode?: boolean;
  /** Префикс API серверной части. */
  webServicesURL: string;
  /** Расположение корневой папки клиента. */
  root?: string;
}

/** Список информационных систем. */
type SystemList = WellManagerSystem[];

/** Информационная система Well Manager.
 * + `id`: {@link SystemID}
 * + `displayName`: {@link DisplayName}
 * + `description: string`
 * */
interface WellManagerSystem {
  /** Идентификатор системы. */
  id: SystemID;
  /** Название системы */
  displayName: DisplayName;
  /** Описание системы. */
  description: string;
}

/** Идентификатор системы. */
type SystemID = string;
