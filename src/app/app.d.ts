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
type SystemList = SystemInfo[];

/** Информация о системе Well Manager.
 * + `id`: {@link SystemID}
 * + `displayName`: {@link DisplayName}
 * + `displayNameShort`: {@link DisplayName}
 * + `description: string`
 * + `version: string | null`
 * + `color: string`
 * */
interface SystemInfo {
  /** Идентификатор системы. */
  id: SystemID;
  /** Заголовок системы. */
  displayName: DisplayName;
  /** Краткое описание системы. */
  displayNameShort: DisplayName;
  /** Описание системы. */
  description: string;
  /** Номер версии системы. */
  version: string | null;
  /** Акцентный цвет системы. */
  color: string;
}

/** Идентификатор системы.
 * @example
 * "GTM_SYSTEM", "PREPARE_SYSTEM"
 * */
type SystemID = string;
