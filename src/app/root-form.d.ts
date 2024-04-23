/** Состояние главной формы.
 * + `id`: {@link ClientID}
 * + `layout`: {@link DockLayout}
 * + `settings`: {@link DockSettings}
 * + `children`: {@link FormDataWM}[]
 * + `activeChildID`: {@link ClientID}
 * */
interface RootFormState {
  /** ID главной формы. */
  id: ClientID,
  /** Базовая разметка приложения. */
  layout: DockLayout;
  /** Настройки главной формы. */
  settings: DockSettings;
  /** Список презентаций. */
  children: FormDataWM[];
  /** ID активной презентации. */
  activeChildID: ClientID;
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

/** Разметка общих элементов.
 * + `common: LayoutManager`
 * + `left`: {@link LeftPanelLayout}
 * */
interface DockLayout {
  /** Менеджер разметки приложения. */
  common: any;
  /** Разметка левой панели. */
  left: LeftPanelLayout;
}

/** Разметка левой панели с параметрами.
 * + `model: Model`
 * + `global`: {@link LeftTabInfo}
 * + `presentation`: {@link LeftTabInfo}
 * + `tree`: {@link LeftTabInfo}
 * */
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

/** Настройки формы **Dock**.
 * + `presentationTree`: {@link PresentationTree}
 * + `dateChanging`: {@link DateChangingPlugin}
 * + `parameterGroups`: {@link ParameterGroup}[]
 * */
interface DockSettings {
  /** Дерево презентаций. */
  presentationTree: PresentationTree;
  /** Плагин, добавляющий связь между параметром года и интервалом дат. */
  dateChanging?: DateChangingPlugin;
  /** Группы параметров для разбиения списка на вкладки. */
  parameterGroups?: ParameterGroup[];
}

/** Добавляет связь между параметром года и интервалом дат. */
interface DateChangingPlugin {
  /** ID параметра года */
  year: ParameterID;
  /** ID параметра интервала дат. */
  dateInterval: ParameterID;
  /** Колонка со значением, в случае, если параметр года типа `TableRow`. */
  columnName: string | null;
}
