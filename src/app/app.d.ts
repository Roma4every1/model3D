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

/** Конфигурация клиента Well Manager.
 * + `devMode?: boolean`
 * + `devDocLink?: string`
 * + `userDocLink?: string`
 * + `contactEmail?: string`
 * + `webServicesURL?: string`
 * + `root?: string`
 * */
interface ClientConfiguration {
  /** Режим разработчика. */
  devMode?: boolean;
  /** Ссылка на документацию для разработчиков. */
  devDocLink?: string;
  /** Ссылка на пользовательскую документацию. */
  userDocLink?: string;
  /** Почта для связи. */
  contactEmail?: string;
  /** Префикс API серверной части. */
  webServicesURL?: string;
  /** Путь к начальной странице относительно хоста. */
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
