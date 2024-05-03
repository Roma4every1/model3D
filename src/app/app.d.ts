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

/** Информация о системе Well Manager. */
interface SystemInfo {
  /** Идентификатор системы. */
  id: SystemID;
  /** Заголовок системы. */
  displayName: string;
  /** Краткое описание системы. */
  displayNameShort: string;
  /** Описание системы. */
  description: string;
  /** Номер версии системы. */
  version: string | null;
  /** Акцентный цвет системы. */
  color: string;
}

/** Идентификатор сессии. */
type SessionID = string;

/** Идентификатор системы.
 * @example
 * "GTM_SYSTEM", "PREPARE_SYSTEM"
 * */
type SystemID = string;
