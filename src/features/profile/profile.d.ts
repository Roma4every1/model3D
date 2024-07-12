/** Состояние профиля. */
interface ProfileState {
  /** Сцена формы профиля. */
  readonly stage: IProfileStage;
  /** Загрузчик формы профиля. */
  readonly loader: IProfileLoader;
  /** Класс для отслеживания изменения размеров холста. */
  readonly observer: ResizeObserver;
  /** Параметры построения профиля. */
  parameters: ProfileParameters;
  /** Канвас профиля. */
  canvas: HTMLCanvasElement;
  /** Состояние загрузки. */
  loading: ProfileLoading;
}

/** Параметры построения профиля. */
interface ProfileParameters {
  /** Список всех пластов, по которым можно построить профиль. */
  strata: ProfileStratum[] | null | undefined;
  /** Список выбранных пластов. */
  selectedStrata: string[] | undefined;
  /** Соотношение Y/X. */
  ratio: number;
}

/** Состояние загрузки данных профиля. */
interface ProfileLoading {
  /** Процент загрузки; значение меньше нуля означает ошибку. */
  percentage: number;
  /** Статус загрузки. */
  status?: string;
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
  setLoading: (percentage: number, status?: string) => void;
  loadStrata(objects: ProfileObjects): Promise<ProfileStratum[]>;
  loadProfile(objects: ProfileObjects, strata: string[], ratio: number): Promise<MapData>;
}

interface ProfileObjects {
  trace: TraceModel;
  stratum: StratumModel;
  place: PlaceModel;
}

interface ProfileStratum {
  name: string;
  code: string;
  selected: boolean;
}

/* --- GeoManager API --- */

interface GMRawLayerData {
  name: string;
  uid: string;
  group: string;
  highscale: string | number;
  lowscale: string | number;
  elements: MapElement[];
}

type GMJobID = string;
