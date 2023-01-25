/** Well Manager React State. */
interface WState {
  appState: AppState,
  canRunReport: CanRunReport,
  carats: CaratsState,
  channelsData: ChannelsData,
  channelsLoading: ChannelsLoading,
  childForms: ChildForms,
  formParams: FormParams,
  formRefs: FormRefs,
  formSettings: FormsSettings,
  formLayout: FormsLayout,
  layout: CommonLayout,
  maps: MapsState,
  presentations: PresentationsState,
  programs: ProgramsState,
  reports: Reports,
  sessionManager: SessionManager,
  windowData: any,
}

/* --- state.appState --- */

/** Данные общего характера.
 * + `config`: {@link ClientConfiguration}
 * + `systemList`: {@link SystemList}
 * + `sessionID`: {@link FetchState} of {@link SessionID}
 * + `rootFormID`: {@link FormID}
 * + `systemID`: {@link SystemID}
 * */
interface AppState {
  config: ClientConfiguration,
  systemList: SystemList,
  sessionID: FetchState<SessionID>,
  rootFormID: FormID,
  systemID: SystemID,
}

/** Состояние загрузки. */
type LoadingState<Type> = {
  loaded: boolean,
  success: boolean | undefined,
  data: Type
};

/** Клиентская конфигурация WMR. */
type ClientConfiguration = {webServicesURL: string, root?: string};

/** Список информационных систем. */
type SystemList = WMWSystem[];

/** Информационная система WellManager. */
interface WMWSystem {
  id: string,
  displayName: string,
  displayNameShort?: string,
  description?: string,
  color?: string,
}

/** ID текущей системы. */
type SystemID = string;


/* --- state.canRunReport --- */

/** Можно ли запустить текущую программу/отчёт. */
type CanRunReport = boolean;


/* --- state.carats --- */

type CaratsState = FormDict<CaratState>;

/** Состояние каротажа.
 * + `settings` — настройки
 * + `columns` — колонки
 * + `canvas` — элемент холста
 * + `drawer` — отрисовщик
 * */
interface CaratState {
  settings: CaratSettings,
  columns: CaratColumn[],
  canvas: HTMLCanvasElement,
  drawer: ICaratDrawer,
}

/* --- state.channelsData --- */

/** Данные каналов. */
type ChannelsData = Record<ChannelName, Channel>;

interface Channel {
  id: ChannelName,
  displayName: string,
  currentRowObjectName: string | null,
  data: ChannelData | null,
  idIndex: number,
  nameIndex: number,
  parentIndex: number,
  properties: ChannelProperty[],
  tableId: string,
}

interface ChannelData {
  Rows: ChannelRow[],
  Columns: ChannelColumn[],
  DataPath: boolean,
  Editable: boolean,
  ModifiedTables: any,
  PrimaryColumn: any,
  TotalsRows: any,
}

interface ChannelRow {
  ID: any,
  Cells: any[],
}

interface ChannelColumn {
  Name: string,
  NetType: string,
  AllowDBNull: boolean
}

interface ChannelProperty {
  name: string,
  fromColumn: string,
  displayName: string,
  treePath: any[],
  file: any,
  lookupChannelName: string | null,
  secondLevelChannelName: string | null,
  lookupData?: LookupDataItem[],
}

interface LookupDataItem {
  id: any,
  value: any,
  text: any,
  parent?: any,
}

/* --- state.channelsLoading --- */

/** Данные о загрузке каналов. */
type ChannelsLoading = {[key: ChannelName]: {loading: IsChannelLoading}};

/** Загружается ли канал. */
type IsChannelLoading = boolean;


/* --- state.childForms --- */

/** Дочерние формы. */
type ChildForms = FormDict<FormChildrenState>;

/** ### Состояние дочерних форм.
 * + `id`: {@link FormID} — ID родителя
 * + `children`: {@link FormChildren} — данные дочерних форм
 * + `openedChildren`: {@link OpenedChildrenList} — открытые формы
 * + `activeChildren`: {@link ActiveChildrenList} — активные формы
 * @example
 * {
 *   id: "1234", children: [{...}, {...}, {...}],
 *   openedChildren: ["1234,5678"], activeChildren: ["1234,5678"],
 * }
 * */
interface FormChildrenState {
  id: FormID,
  children: FormChildren,
  openedChildren: OpenedChildrenList,
  activeChildren: ActiveChildrenList,
}

/** Список данных о дочерних формах. */
type FormChildren = FormDataWMR[];
/** Список открытых дочерних форм. */
type OpenedChildrenList = FormID[];
/** Список активных дочерних форм. */
type ActiveChildrenList = FormID[];

/* --- state.formParams --- */

/** Параметры форм. */
type FormParams = FormDict<FormParameter[]>;


/* --- state.formRefs --- */

/** Ссылки на формы. */
type FormRefs = FormDict;


/* --- state.formSettings --- */

/** Настройки форм. */
type FormsSettings = FormDict<FormSettings>;

/** Настройки формы. */
type FormSettings = DockFormSettings | GridFormSettings | DataSetFormSettings | ChartFormSettings;


/* --- state.formLayout --- */

/** Разметка форм. */
type FormsLayout = FormDict;


/* --- state.layout --- */

/** Разметка общих элементов. */
interface CommonLayout {
  dock: DockLayout,
  left: LeftPanelLayout,
}

/** Разметка контейнера. */
interface DockLayout {
  /** Номер активной верхней вкладки. */
  selectedTopTab: number,
  /** Нормер активной вкладки справа */
  selectedRightTab: number,
  /** Высота тела верхней панели. */
  topPanelHeight: number,
  /** Ширина левой вкладки с параметрами. */
  leftPanelWidth: number,
  /** Ширина панели с права. */
  rightPanelWidth: number,
}

/** Разметка левой панели с параметрами.
 * + высота <= 0 — не показывать
 * + высота == 1 — автоподбор
 * + иначе принудительный размер
 * */
interface LeftPanelLayout {
  /** Высотка вкладки _"Глобальные параметры"_. */
  globalParamsHeight: number,
  /** Высотка вкладки _"Параметры презентации"_. */
  formParamsHeight: number,
  /** Высотка вкладки _"Презентации"_ (дерево). */
  treeHeight: number,
}


/* --- state.maps --- */

/** Хранилище состояний карт. */
type MapsState = { multi: FormDict<MultiMapState>, single: FormDict<MapState> };

/** ## Состояние мультикарты.
 * + `sync: boolean` — синхронизация СК
 * + `children`: {@link FormID}[] — карты
 * */
interface MultiMapState {
  sync: boolean,
  children: FormID[],
}

/** ## Состояние карты.
 * + `mapData`: {@link MapData} — данные для отрисовки
 * + `isLoadSuccessfully` — состояние загрузки
 * + `canvas` — HTML элемент `<canvas>`
 * + `drawer` — объект отрисовщика карты
 * + `owner`: {@link MapOwner} — владелец
 * + `mapID`: {@link MapID} — ID карты
 * + `selecting`: {@link MapSelectingState}
 * + `isModified` — изменена ли карта
 * + `cursor` — стиль курсора
 * + `utils?` — вспомогательные функции
 * @see MapsState
 * */
interface MapState {
  mode: number,
  mapData: MapData,
  legends: LoadingState<any>,
  activeLayer: MapLayer,
  isLoadSuccessfully: boolean | undefined,
  canvas: MapCanvas,
  drawer: MapsDrawer,
  owner: MapOwner,
  mapID: MapID,
  element: MapElement,
  isElementEditing: boolean,
  selecting: MapSelectingState,
  oldData: {x: number | null, y: number | null, arc: PolylineArc | null, ange: number | null}
  isModified: boolean,
  cursor: string,
  childOf: FormID,
  scroller: { setList(list: MapCanvas[]) } | null,
  utils: MapUtils,
}

type MapCanvas = HTMLCanvasElement & {selectingMode: boolean, blocked: boolean, events: any};

interface MapUtils {
  updateCanvas(cs?: {centerX: number, centerY: number, scale: MapScale}, context?: any): void,
  pointToMap(point: ClientPoint): ClientPoint,
}

/** ## Состояние выделения карты.
 * + `element` — выбранный элемент
 * + `nearestElements` — список ближайших элементов
 * + `activeIndex` — иднекс списка элементов
 * + `lastPoint` — точка последнего клика
 * @see MapState
 * */
interface MapSelectingState {
  nearestElements: any[],
  activeIndex: number,
  lastPoint: ClientPoint,
}


/* --- state.presentations --- */

type PresentationsState = PresentationItem[];

interface PresentationItem {
  id: string | null,
  nodeId: string | null,
  text: string | null,
  items: PresentationItem[] | null,
  selected?: boolean,
  expanded?: boolean,
}


/* --- state.programs --- */

type ProgramsState = FormDict<FetchState<ProgramListData>>;

type ProgramListData = ProgramListItem[];

interface ProgramListItem {
  id: string,
  displayName: string,
  needCheckVisibility: boolean,
  paramsForCheckVisibility: string[],
  visible: boolean,
}


/* --- state.reports --- */

type Reports = Record<string, Report>;

interface Report {
  Comment: string,
  Cur_page: any,
  DefaultResult: string,
  DisplayType: number,
  Dt: string,
  Error: string,
  ErrorType: any,
  Hash: string,
  ID_PR: FormID,
  Id: string,
  IsReport: string,
  ModifiedTables: any,
  Ord: string,
  Pages: any,
  Path: string,
  Progress: number,
  SessionId: SessionID,
  SystemName: string,
  Usr: string,
  WrongResult: boolean,
}

interface OperationResult {
  isReady: boolean,
  report: Report,
  reportLog: any,
}
