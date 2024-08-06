/** Состояние главной формы. */
type RootClient = SessionClient<'dock', DockSettings, DockLayout>;

/** Настройки корневого клиента. */
interface DockSettings {
  /** Дерево презентаций. */
  presentationTree: PresentationTree;
  /** Группы параметров для разбиения списка на вкладки. */
  parameterGroups?: ParameterGroup[];
}

/** Дерево презентаций. */
type PresentationTree = PresentationTreeItem[];

/** Элемент дерева презентаций. */
interface PresentationTreeItem {
  /** ID презентации, есть только у листьев. */
  id: ClientID;
  /** Название презентации в дереве. */
  text: string;
  /** Дочерние элементы: группы или презентации. */
  items?: PresentationTreeItem[];
  /** Выбрана ли текущая презентация. */
  selected?: boolean;
  /** Раскрыта ли группа. */
  expanded?: boolean;

  /** Виден ли узел дерева в данный момент. */
  visible: boolean;
  /** Шаблон видимости. */
  visibilityString?: any; // ParameterStringTemplate
}

/* --- Dock Layout --- */

/**
 * Разметка приложения.
 * + `controller: LayoutController`
 * + `left`: {@link LeftPanelLayout}
 */
interface DockLayout {
  /** Контроллер разметки приложения. */
  controller: any; // LayoutController
  /** Разметка левой панели. */
  left: LeftPanelLayout;
}

/** Разметка левой панели. */
interface LeftPanelLayout {
  /** Model из `flex-layout-react`. */
  model: any; // Model
  /** Вкладка глобальных параметров. */
  globalParameters: LeftTabInfo;
  /** Вкладка параметров презентации. */
  presentationParameters: LeftTabInfo;
  /** Вкладка дерева презентаций. */
  presentationTree: LeftTabInfo;
}

/** Информация о вкладке. */
interface LeftTabInfo {
  /** ID вкладки. */
  id: string;
  /** Показывать ли вкладку. */
  show: boolean;
  /** Название вкладки. */
  displayName: string;
  /** ID родителя. */
  parent?: string;
  /** Индекс вкладки в группе. */
  index?: number;
  /** Запрещено ли менять видимость вкладки. */
  disabled?: boolean;
}

/**
 * Типы поддерживаемых вкладок левой панели.
 * + `globalParameters` — глобальные параметры
 * + `presentationParameters` — параметры презентации
 * + `presentationTree` — дерево презентаций
 */
type LeftTabType = 'globalParameters' | 'presentationParameters' | 'presentationTree';
