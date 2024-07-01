/** Состояние главной формы. */
type RootClient = SessionClient<'dock', DockSettings, DockLayout>;

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

/** Разметка общих элементов.
 * + `controller: LayoutController`
 * + `left`: {@link LeftPanelLayout}
 */
interface DockLayout {
  /** Контроллер разметки приложения. */
  controller: any; // LayoutController
  /** Разметка левой панели. */
  left: LeftPanelLayout;
}

/** Разметка левой панели с параметрами.
 * + `model: Model`
 * + `global`: {@link LeftTabInfo}
 * + `presentation`: {@link LeftTabInfo}
 * + `tree`: {@link LeftTabInfo}
 */
interface LeftPanelLayout {
  /** Model из `flex-layout-react`. */
  model: any; // Model
  /** Панель глобальных параметров. */
  global: LeftTabInfo;
  /** Панель параметров презентации. */
  presentation: LeftTabInfo;
  /** Дерево презентаций. */
  tree: LeftTabInfo;
}

/** Информация о вкладке. */
interface LeftTabInfo {
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

/** Типы поддерживаемых вкладок левой панели. */
type LeftTabType = 'global' | 'presentation' | 'tree';

/* --- Dock Settings --- */

/** Настройки корневого клиента. */
interface DockSettings {
  /** Дерево презентаций. */
  presentationTree: PresentationTree;
  /** Группы параметров для разбиения списка на вкладки. */
  parameterGroups?: ParameterGroup[];
}
