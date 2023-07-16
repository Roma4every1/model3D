/** Состояние главной формы.
 * + `id`: {@link FormID}
 * + `layout`: {@link DockLayout}
 * + `settings`: {@link DockSettings}
 * + `children`: {@link FormDataWMR}[]
 * + `activeChildID`: {@link FormID}
 * + `presentationsTree`: {@link PresentationTree}
 * */
interface RootFormState {
  /** ID главной формы. */
  id: FormID,
  /** Базовая разметка приложения. */
  layout: DockLayout,
  /** Настройки главной формы. */
  settings: DockSettings,
  /** Список презентаций. */
  children: FormDataWMR[],
  /** ID активной презентации. */
  activeChildID: FormID,
  /** Дерево презентаций. */
  presentationTree: PresentationTree,
}

/** Дерево презентаций. */
type PresentationTree = PresentationTreeItem[];

/** Элемент дерева презентаций. */
interface PresentationTreeItem {
  /** ID презентации, есть только у листьев. */
  id: FormID,
  /** Название презентации в дереве. */
  text: DisplayName,
  /** Дочерние элементы: группы или презентации. */
  items?: PresentationTreeItem[],
  /** Выбрана ли текущая презентация. */
  selected?: boolean,
  /** Раскрыта ли группа. */
  expanded?: boolean,

  /** Виден ли узел дерева в данный момент. */
  visible: boolean,
  /** Строка видимости презентации. */
  visibilityString?: string,
  /** Параметры, необходимые для расчёта видимости. */
  visibilityParameters?: Set<ParameterID>,
  /** Обработчик видимости презентации.. */
  visibilityHandler?: (parameters: Parameter[]) => boolean,
}

/* --- Dock Layout --- */

/** Разметка общих элементов.
 * + `common`: {@link CommonLayout}
 * + `left`: {@link LeftPanelLayout}
 * */
interface DockLayout {
  /** Разметка главной формы. */
  common: CommonLayout,
  /** Разметка левой панели. */
  left: LeftPanelLayout,
}

/** Разметка главной формы.
 * + `selectedTopTab` — индекс активной верхней вкладки.
 * + `selectedRightTab` — индекс активной вкладки справа
 * + `topPanelHeight` — высота тела верхней панели
 * + `leftPanelWidth` — ширина левой панели
 * + `rightPanelWidth` — ширина правой панели
 * @see DockLayout
 * */
interface CommonLayout {
  /** Индекс активной верхней вкладки. */
  selectedTopTab: number,
  /** Индекс активной вкладки справа */
  selectedRightTab: number,
  /** Высота тела верхней панели. */
  topPanelHeight: number,
  /** Ширина левой панели с параметрами. */
  leftPanelWidth: number,
  /** Ширина правой панели. */
  rightPanelWidth: number,
}

/** Разметка левой панели с параметрами.
 * + `model: Model`
 * + `global`: {@link LeftTabInfo}
 * + `presentation`: {@link LeftTabInfo}
 * + `tree`: {@link LeftTabInfo}
 * */
interface LeftPanelLayout {
  /** Model из `flex-layout-react`. */
  model: any, // Model
  /** Панель глобальных параметров. */
  global: LeftTabInfo,
  /** Панель параметров презентации. */
  presentation: LeftTabInfo,
  /** Дерево презентаций. */
  tree: LeftTabInfo,
}

/** Информация о вкладке. */
interface LeftTabInfo {
  /** Показывать ли вкладку. */
  show: boolean,
  /** Название вкладки. */
  displayName: DisplayName,
  /** ID родителя. */
  parent?: string,
  /** Индекс вкладки в группе. */
  index?: number,
  /** Запрещено ли менять видимость вкладки. */
  disabled?: boolean,
}

/** Типы поддерживаемых вкладок левой панели. */
type LeftTabType = 'global' | 'presentation' | 'tree';

/* --- Dock Settings --- */

/** Настройки формы **Dock**.
 * + `dateChanging`: {@link DateChangingPlugin}
 * + `parameterGroups`: {@link ParameterGroup}[]
 * */
interface DockSettings {
  /** Плагин, добавляющий связь между параметром года и интервалом дат. */
  dateChanging: DateChangingPlugin | null,
  /** Группы параметров для разбиения списка на вкладки. */
  parameterGroups: ParameterGroup[] | null,
}

/** Добавляет связь между параметром года и интервалом дат. */
interface DateChangingPlugin {
  /** ID параметра года */
  year: ParameterID,
  /** ID параметра интервала дат. */
  dateInterval: ParameterID,
  /** Колонка со значением, в случае, если параметр года типа `TableRow`. */
  columnName: string | null,
}
