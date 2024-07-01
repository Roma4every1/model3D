/** Общие данные приложения. */
interface AppState {
  /** Путь к начальной странице относительно хоста. */
  location: string;
  /** Клиентская конфигурация. */
  config: ClientConfig;
  /** Список систем. */
  systemList: SystemList;
  /** ID текущей системы. */
  systemID: SystemID;
  /** ID из `setInterval` для запроса `extendSession`. */
  sessionIntervalID: number;
  /** Состояние загрузки. */
  loading: AppLoadingState;
  /** Очередь инициализации презентаций. */
  readonly initQueue: ClientID[];
}

/** Состояние загрузки приложения. */
interface AppLoadingState {
  /** Шаг загрузки. */
  step: AppLoadingStep;
  /** Сообщение ошибки  */
  error?: string;
  /** Если true, загрузка завершена. */
  done?: boolean;
}

/**
 * Шаги загрузки приложения:
 * + `init` — инициализация приложения (конфиг и список систем)
 * + `wait` — ожидание загрузки новой сессии
 * + `session` — создание новой сессии
 * + `data` — загрузка начальных данных сессии
 */
type AppLoadingStep = 'init' | 'wait' | 'session' | 'data';

/** Конфигурация клиента. */
interface ClientConfig {
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

/** Идентификатор системы. */
type SystemID = string;
