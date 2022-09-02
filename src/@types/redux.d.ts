/* --- state.appState --- */

/** Состояние, необходимое для компонента `SystemRouter`. */
type AppState = {
  config: LoadingState<ClientConfiguration>,
  systemList: LoadingState<SystemList>,
  sessionID: LoadingState<SessionID>,
  systemID: SystemID,
}

/** Состояние загрузки. */
type LoadingState<Type> = {
  loaded: boolean,
  success: boolean | undefined,
  data: Type
};

/** Клиентская конфигурация WMR. */
type ClientConfiguration = {webServicesURL: string};

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
type ChildForms = {[key: FormID]: any};


/* --- state.formParams --- */

/** Параметры форм. */
type FormParams = {[key: FormID]: any};


/* --- state.formRefs --- */

/** Ссылки на формы. */
type FormRefs = {[key: FormID]: any};


/* --- state.formSettings --- */

/** Настройки форм. */
type FormSettings = {[key: FormID]: any};


/* --- state.formStates --- */

/** Состояния форм. */
type FormStates = {[key: FormID]: FormState};

type FormState = {[key: ParameterID]: ParamState};

/** Состояние параметра:
 * + value — текущее значение параметра
 * + setValue — функция изменения параметров формы (из хука useState)
 * @see FormState
 * */
interface ParamState<Type> {
  value: Type,
}


/* --- state.layout --- */

/** Разметка. */
type FormsLayout = {
  plugins: {
    inner: object[],
    left: object[],
    right: object[],
    strip: object[],
    top: object[],
  },
  topSize: number,
  [key: FormID]: any
};


/* --- state.maps --- */

/** Хранилище состояний карт. */
type MapsState = {[key: FormID]: MapState};

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
  utils: MapUtils,
}

type MapCanvas = HTMLCanvasElement & {selectingMode: boolean, blocked: boolean};

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

/* --- state.reports --- */

//TODO: типизация


/* --- state.sessionId --- */

/** Идентификатор сессии. */
type SessionID = string;


/* --- state.sessionManager --- */

//TODO: типизация


/* --- state.windowData --- */

//TODO: типизация
