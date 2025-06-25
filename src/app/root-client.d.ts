/** Состояние главной формы. */
type RootClient = SessionClient<'dock', DockSettings, AppLayout>;

/** Настройки корневого клиента. */
interface DockSettings {
  /** Дерево презентаций. */
  presentationTree: any; // PresentationTree
  /** Группы параметров для разбиения списка на вкладки. */
  parameterGroups?: ParameterGroup[];
}

/** Состояние разметки приложения. */
interface AppLayout {
  /** Разметка экрана. */
  readonly main: IMainLayoutController;
  /** Состояние разметки левой панели. */
  readonly left: ILeftLayoutController;
  /** Исходный XML разметки. */
  readonly source: any; // XRawElement
}

/** Контроллер разметки приложения. */
interface IMainLayoutController {
  /** Модель из FlexLayout React. */
  readonly model: any;
  /** Активные объекты в системе. */
  readonly objects: Set<string>;

  showTab(tabID: string, index?: number, select?: boolean): void
  updateTabVisibility(presentation: PresentationState): void;
  updateTraceEditTabVisibility(need: boolean): void;
}

/** Контроллер разметки левой панели. */
interface ILeftLayoutController {
  /** Модель из FlexLayout React. */
  readonly model: any;
  /** Состояние вкладки с глобальными параметрами. */
  readonly globalParameters: {show: boolean, disabled?: boolean};
  /** Состояние вкладки с параметрами презентации. */
  readonly presentationParameters: {show: boolean, disabled?: boolean};
  /** Состояние вкладки с деревом презентаций. */
  readonly presentationTree: {show: boolean, disabled?: boolean};

  showTab(id: LeftTabID): void;
  hideTab(id: LeftTabID): void;
}

/**
 * Типы поддерживаемых вкладок левой панели.
 * + `globalParameters` — глобальные параметры
 * + `presentationParameters` — параметры презентации
 * + `presentationTree` — дерево презентаций
 */
type LeftTabID = 'globalParameters' | 'presentationParameters' | 'presentationTree';
