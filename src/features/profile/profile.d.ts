type ProfileStates = Record<ClientID, ProfileState>;

/** Состояние профиля. */
interface ProfileState {
  /** Канвас профиля. */
  canvas: HTMLCanvasElement;
  /** Сцена формы профиля. */
  stage: IProfileStage;
  /** Загрузчик формы профиля. */
  loader: IProfileLoader;
  /** Состояние загрузки. */
  loading: ProfileLoading;
  /** Класс для отслеживания изменения размеров холста. */
  observer: ResizeObserver;
}

/** Состояние загрузки данных профиля. */
interface ProfileLoading {
  /** Процент загрузки. */
  percentage: number;
  /** Статус загрузки. */
  status: string;
  /** Аргументы шаблона локали. */
  statusOptions?: I18nOptions;
}

/** Сцена профиля. */
interface IProfileStage {
  readonly scroller: IMapScroller;
  handleMouseDown(event: MouseEvent): void;
  handleMouseMove(event: MouseEvent): void;
  handleMouseWheel(event: WheelEvent): void;

  /** Устанваливает канвас сцены. */
  setCanvas(canvas: HTMLCanvasElement): void;
  /** Обновляет вид в соответствии с текущими размерами холста. */
  resize(): void;
  /** Устанавливает данные сцены профиля. */
  setData(mapData: MapData): void;
  /** Возвращает данные профиля. */
  getMapData(): MapData;
  /** Отрисовывает всю сцену профиля. */
  render(): void;
}

/* --- Loader --- */

/** Загрузчик данных профиля. */
interface IProfileLoader {
  flag: number;
  cache: ProfileDataCache;
  activeStrata: string[];

  setLoading: (l: Partial<CaratLoading>) => void;
  loadProfileData(objects: GMMOJobObjectParameters);
  loadPlData(objects: GMMOJobObjectParameters);
}

/** Кэш данных профиля. */
interface ProfileDataCache {
  /** Данные контейнера профиля. */
  profileData: MapData;
  /** Список всех доступных пластов. */
  plasts: GMMOPlJobDataItem[];
}

interface GMMOJobParams {
  objectCode: string;
  organizationCode: string;
  plastCode: string;
  mapCode: string;
}

interface GMMOJobObjectParameters {
  trace: TraceModel;
  stratum: StratumModel;
  place: PlaceModel;
}

/* --- GMMO API --- */

type GMMOJobData = GMMOPlastsJobDataResult | GMMOProfileDataResult;

interface GMMOPlJobDataItem {
  name: string;
  code: string;
  selected: string;
}

interface GMMOPlastsJobDataResult {
  operationid: string;
  plast?: GMMOPlJobDataItem[];
}

interface GMMOProfileDataResult {
  mi: GMMOMiData;
  profileInnerContainer: GMMOProfileInnerContainerData;
}

interface GMMOProfileInnerContainerData {
  layers:Record<string, GMMORawLayerData>;
}

interface GMMOMiData {
  layers: Record<string, MapLayerRaw>;
}

interface GMMORawLayerData {
  group: string;
  highscale: string | number;
  lowscale: string | number;
  name: string;
  uid: string;
  elements: MapElement[];
}
