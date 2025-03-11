/** Состояние глобальных объектов. */
interface GlobalState {
  /** Глобальные настройки всего приложения. */
  config: AppConfig;
  /** Глобальные переменные приложения. */
  variables: Record<string, any>;
}

/** Общая конфигурация приложения. */
interface AppConfig {
  /** Режим разработчика. */
  mode?: string;
  /** Префикс API серверной части. */
  api?: string;
  /** Ссылка на документацию для разработчиков. */
  devDocLink?: string;
  /** Ссылка на пользовательскую документацию. */
  userDocLink?: string;
  /** Почта для связи. */
  contactEmail?: string;
}
