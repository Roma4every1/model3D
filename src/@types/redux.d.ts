/** Well Manager State. */
interface WState {
  appState: AppState,
  canRunReport: CanRunReport,
  carats: CaratsState,
  channelsData: ChannelsData,
  channelsLoading: ChannelsLoading,
  childForms: ChildForms,
  formParams: FormParams,
  formRefs: FormRefs,
  formSettings: FormSettings,
  formLayout: FormsLayout,
  layout: CommonLayout,
  charts: ChartsState,
  maps: MapsState,
  presentations: PresentationsState,
  programs: ProgramsState,
  reports: any,
  sessionId: SessionID,
  sessionManager: SessionManager,
  windowData: any,
}

/* --- state.appState --- */

/** Состояние, необходимое для компонента `SystemRouter`. */
type AppState = {
  config: FetchState<ClientConfiguration>,
  systemList: FetchState<SystemList>,
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

/** Можно ли отправить репорт. */
type CanRunReport = boolean;


/* --- state.carats --- */

type CaratsState = FormDict<CaratState>;

/** Состояние каротажа.
 * + `columns` — колонки
 * + `canvas` — элемент холста
 * */
interface CaratState {
  settings: CaratSettings,
  columns: CaratColumn[],
  canvas: HTMLCanvasElement,
}

/* --- state.channelsData --- */

/** Данные каналов. */
type ChannelsData = {[key: ChannelName]: any};


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
type FormSettings = FormDict;


/* --- state.formLayout --- */

/** Разметка форм. */
type FormsLayout = Record<FormID, FormLayout>;

interface FormLayout {
  global: any,
  borders?: any[],
  layout: any,
}


/* --- state.layout --- */

/** Разметка общих элементов. */
type CommonLayout = {
  left: string[],
  dock: DockLayout,
};

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


/* --- state.charts --- */

type ChartsState = Record<FormID, ChartState>;

interface ChartState {
  tooltip: boolean,
  seriesSettings: any,
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

type PresentationsState = FetchState<PresentationItem> & {sessionID: SessionID, formID: FormID};

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

//TODO: типизация


/* --- state.sessionId --- */

/** Идентификатор сессии. */
type SessionID = string;

/* --- state.windowData --- */

//TODO: типизация
