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

/** Информация о системе Well Manager. */
interface SystemInfo {
  /** Идентификатор системы. */
  id: SystemID;
  /** Заголовок системы. */
  displayName: string;
  /** Описание системы. */
  description: string;
  /** Акцентный цвет системы. */
  color: string;
  /** Выделять ли название системы сверху. */
  highlight?: ColorString | boolean;
  /** Номер версии системы. */
  version?: string;
  /** Префикс API сервиса GeoManager. */
  apacheUrl?: string;
  /** Флаг переноса текста в различных формах. */
  dataWrap?: boolean;
}

/** Идентификатор сессии. */
type SessionID = string;

/** Идентификатор системы. */
type SystemID = string;
