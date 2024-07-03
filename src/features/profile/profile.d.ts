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

/** Загрузчик данных профиля. */
interface IProfileLoader {
  cache: ProfileDataCache;
  activeStrata: string[];
  setLoading: (percentage: number, status?: string) => void;

  loadStrata(objects: GMJobObjectParameters): Promise<void>;
  loadProfileData(objects: GMJobObjectParameters): Promise<void>;
}

/** Кэш данных профиля. */
interface ProfileDataCache {
  /** Список всех доступных пластов. */
  strata: GMPlJobDataItem[];
  /** Данные контейнера профиля. */
  profileData: MapData;
}

/* --- GeoManager API --- */

interface GMJobObjectParameters {
  trace: TraceModel;
  stratum: StratumModel;
  place: PlaceModel;
}

interface GMJobPayload {
  objectCode: string;
  organizationCode: string;
  plastCode: string;
  mapCode: string;
}

interface GMPlJobDataItem {
  name: string;
  code: string;
  selected: string;
}

interface GMStrataResult {
  operationid: string;
  plast?: GMPlJobDataItem[];
}

interface GMProfileResult {
  mi: GMMiData;
  profileInnerContainer: GMProfileInnerContainerData;
}

interface GMProfileInnerContainerData {
  layers:Record<string, GMRawLayerData>;
}

interface GMMiData {
  layers: Record<string, MapLayerRaw>;
}

interface GMRawLayerData {
  name: string;
  uid: string;
  group: string;
  highscale: string | number;
  lowscale: string | number;
  elements: MapElement[];
}

type GMJobID = string;
