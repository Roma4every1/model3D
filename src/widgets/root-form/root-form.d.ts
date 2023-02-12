/** Состояние главной формы.
 * + `id`: {@link FormID}
 * + `layout`: {@link DockLayout}
 * + `settings`: {@link DockSettings}
 * + `children`: {@link FormDataWMR}[]
 * + `activeChildID`: {@link FormID}
 * + `presentationsTree`: {@link PresentationsTree}
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
  presentationsTree: PresentationsTree,
}

/** Дерево презентаций. */
type PresentationsTree = PresentationTreeItem[];

/** Элемент дерева презентаций. */
interface PresentationTreeItem {
  id: string | null,
  nodeId: string | null,
  text: string | null,
  items: PresentationTreeItem[] | null,
  selected?: boolean,
  expanded?: boolean,
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
 * + высота <= 0 — не показывать
 * + высота == 1 — автоподбор
 * + иначе принудительный размер
 * @see DockLayout
 * */
interface LeftPanelLayout {
  /** Высотка вкладки _"Глобальные параметры"_. */
  globalParamsHeight: number,
  /** Высотка вкладки _"Параметры презентации"_. */
  formParamsHeight: number,
  /** Высотка вкладки _"Презентации"_ (дерево). */
  treeHeight: number,
}

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

interface ParameterGroup {
  code: string,
  displayName: DisplayName,
}
interface DateChangingPlugin {
  year: ParameterID,
  dateInterval: ParameterID,
  columnName: string | null,
}
