/** Well Manager React State. */
interface WState {
  /** Данные общего характера. */
  appState: AppState,
  /** Состояние корневой формы. */
  root: RootFormState,
  /** Состояния презентаций. */
  presentations: PresentationDict,
  /** Состояния форм. */
  forms: FormsState,
  /** Параметры форм. */
  parameters: ParamDict,
  /** Данные каналов. */
  channels: ChannelDict,
  /** Хранилище данных таблиц. */
  tables: TablesState,
  // /** Хранилище каротажных диаграмм. */
  // carats: CaratsState,
  /** Хранилище карт. */
  maps: MapsState,
  /** Состояние отчётов и SQL-программ. */
  reports: Reports,
  /** Окна и диалоги. */
  windowData: any,
  /** Состояние серверных запросов. */
  fetches: FetchesState,
}

/* --- --- --- */

/** Данные общего характера.
 * + `config`: {@link ClientConfiguration}
 * + `systemList`: {@link SystemList}
 * + `sessionID`: {@link SessionID}
 * + `systemID`: {@link SystemID}
 * */
interface AppState {
  /** Клиентская конфигурация. */
  config: ClientConfiguration,
  /** Список систем. */
  systemList: SystemList,
  /** Состояние сессии. */
  sessionID: SessionID,
  /** ID текущей системы. */
  systemID: SystemID,
}

/** Клиентская конфигурация WMR. */
type ClientConfiguration = {webServicesURL: string, root?: string};

/** Список информационных систем. */
type SystemList = SystemWMR[];

/** Информация о системе. */
interface SystemWMR {
  id: SystemID,
  displayName: string,
  description: string,
}

/** ID системы. */
type SystemID = string;

/* --- Session Manager --- */

interface SessionManager {
  startSession(isDefault?: boolean): Promise<Res<SessionID>>
  stopSession(): Promise<void>
  saveSession(): Promise<void>
  loadSessionByDefault(): Promise<void>
}
