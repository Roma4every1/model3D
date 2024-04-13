/* --- STATE --- */

type ProfileStates = Record<FormID, ProfileState>;

/** Состояние профиля.
 * + `canvas: HTMLCanvasElement`
 * + stage: IProfileStage;
 * + loader: IProfileLoader;
 * + loading: ProfileLoading;
 * */
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

/* --- --- */

/* --- LOADER --- */

/** Состояние загрузки данных профиля.
 * + `percentage: number`
 * + `status: string`
 * + `statusOptions?`: {@link I18nOptions}
 * */
interface ProfileLoading {
  /** Процент загрузки. */
  percentage: number;
  /** Статус загрузки. */
  status: string;
  /** Аргументы шаблона локали. */
  statusOptions?: I18nOptions;
}

/** Загрузчик данных профиля. */
interface IProfileLoader {
  flag: number;
  cache: ProfileDataCache;

  setLoading: (l: Partial<ProfileLoading>) => void;
  loadProfileData(formID: FormID, trace: TraceModel, channels: ChannelDict);
}

interface TopBaseMapsDataRaw {
  plastCode: number;
  mapType: string;
  containerData: MapField;
}

/** Строка канала инлкинометрии WellIncl. */
interface ProfileInclMark {
  NWELL_ID: number;
  ABSMARK: number;
  AZIMUTH: number;
  DEPTH: number;
  DIRANGLE: number;
  ELONGATION: number;
  INCL: number;
  SHIFT: number;
  SHIFTX: number;
  SHIFTY: number;
}

/** Строка канала литологии PlInfo. */
interface ProfileLitPiece {
  NWELL_ID: number;
  PL_ID: number;
  PL_NAME: string;
  KROW: number;
  PODOSH: number;
  KROW_ABS: number;
  PODOSH_ABS: number;
  LIT_ID: number;
  LIT_NAME: string,
  MVODA: number;
  MNEFT: number;
  MGAS: number;
  POR: number;
  PERM: number;
  SHAL: number;
  TYPE_CODE: number;
  TYPE_NAME: string;
  SAT_ID: number;
  SAT_NAME: string;
  LITSAT: number;
  LITSAT_NAME: string;
}

/** Кэш данных профиля. */
interface ProfileDataCache {
  plastsData: ProfilePlastMap;
}

/** Словарь пластов, содержит классы, выполняющие посмотрение профиля. */
type ProfilePlastMap = Map<number, IProfilePlast>;

/* --- --- */

/* --- SCENE --- */

/** Сцена профиля. */
interface IProfileStage {
  handleMouseMove(point: Point, bx: number, by: number): void;
  handleMouseWheel(point: Point, direction: 1 | -1, shiftKey: boolean): void

  /** Устанваливает канвас сцены. */
  setCanvas(canvas: HTMLCanvasElement): void;
  /** Обновляет вид в соответствии с текущими размерами холста. */
  resize(): void;
  /** Устанавливает данные сцены профиля. */
  setData(cache: ProfileDataCache): void;
  /** Отрисовывает всю сцену профиля. */
  render(): void;
}

/* --- --- */

/* --- DRAWER --- */

/** Отрисовщик профиля. */
interface IProfileDrawer {
  setYAxisSettings(settings: any);
  setXAxisSettings(settings: any);
  setContext(context: CanvasRenderingContext2D);
  render(plastDataMap: ProfilePlastDataMap, inclData: ProfileInclDataMap)
}

/** Порт просмотра. */
interface ProfileViewport {
  /** Координата начала вьюпорта по X (в пикселях). */
  startX: number;
  /** Координата начала вьюпорта по Y (в пикселях). */
  startY: number;

  /** Координата начала вьюпорта по X (в реальных координатах). */
  currentX: number;
  /** Координата начала вьюпорта по Y (в реальных координатах). */
  currentY: number;
  /** Координата конца вьюпорта по Y (в реальных координатах). */
  currentMaxX: number;
  /** Координата конца вьюпорта по Y (в реальных координатах). */
  currentMaxY: number;

  /** Ширина области просмотра (в пикселях). */
  width: number;
  /** Высота области просмотра (в пикселях). */
  height: number;
  /** Ширина области просмотра (в реальных координатах). */
  realWidth: number;
  /** Высота области просмотра (в реальных координатах). */
  realHeight: number;

  /** Минимально возможная координата по X (в реальных координатах). */
  minX: number;
  /** Максимально возможная координата по X (в реальных координатах). */
  maxX: number;
  /** Минимально возможная координата по Y (в реальных координатах). */
  minY: number;
  /** Максимально возможная координата по Y (в реальных координатах). */
  maxY: number;
}

/** Настройки оси X. */
interface ProfileXAxisSettings {
  xMin: number;
  xMax: number;
  xDelta: number;
}

/** Настройки оси Y. */
interface ProfileYAxisSettings {
  yMin: number;
  yMax: number;
  yDelta: number;
}

/** Конфиг отрисовщика профиля. */
interface ProfileDrawerConfig {
  /** Настройки осей. */
  axis: {
    /** Базовый размер пометки. */
    markSize: number,
  },
}

/* --- --- */

/* --- BUILDING PROFILE --- */

/** Класс, содержащий данные о трассе профиля. */
interface IProfileTrace {
  /** Узлы трассы. */
  nodes: IProfileWell[];
  /** Скважины трассы (в том числе дополнительные для нахождения литологии на слоях). */
  wells: IProfileWell[];
  /** Расстояние вдоль трассы. */
  distance: number;
  /** Линии трассы между узлами. */
  lines: TraceLineData[];
  /** Промежуточные точки трассы профиля. */
  points: TracePoint[];
}

/** Линия трассы между узлами. */
interface TraceLineData {
  /** Начальный узел. */
  startNode: IProfileWell;
  /** Конечный узел. */
  endNode: IProfileWell;
  /** Точки линии. */
  points: TracePoint[];
  /** Расстояние от последней точки линии до конечного узла. */
  remainder: number;
  /** Расстояние вдоль линии. */
  distance: number;
}

/** Промежуточная точка трассы профиля. */
interface TracePoint extends Point {
  /** Расстояние вдоль трассы. */
  distance: number;
  /** Ближайщая к точке скважина. */
  nearestWell?: IProfileWell;
}

/** Класс, содержащий данные о пласте профиля. */
interface IProfilePlast {
  borderLine: ProfileBorderLineData;
  maxThickness: number;
  maxY: number;
  minY: number;

  layers: IProfileLayer[];
}

/** Класс, содержащий данные слое пласта профиля. */
interface IProfileLayer {
  borderLine: ProfileBorderLineData;
  topBaseY: number;
}

/** Класс, содержащий данные о скважине профиля. */
interface IProfileWell {
  id: number;
  x: number;
  y: number;
  /** Класс с данными инклинометрии скважины. */
  inclinometry?: IProfileIncl;
  /** Данные литологии скважины. */
  lithology?: ProfileLitPiece[];
}

/** Класс для управления инклинометрией профиля. */
interface IProfileIncl {
  /** Данные инклинометрии (скважина => отметки инклинометрии). */
  data: Map<number, ProfileInclMark[]>;
  /** Возвращает значение глубины для указанной абсолютной отметки. */
  getDepth(wellId: number, absMark: number): number;
}

/** Интервльная линия профиля. */
type ProfileBorderLineData = ProfileLinePoint[];

/** Точка интервльной линий (двух ограничивающих линий) профиля. */
interface ProfileLinePoint {
  x: number;
  y: number;
  /** Расстояние вдоль трассы. */
  distance: number;
  /** Абсолютная отметка верхней границы интервала. */
  topAbsMark: number;
  /** Абсолютная отметка нижней границы интервала. */
  baseAbsMark: number;
  /** Ближайшая скважина. */
  well?: IProfileWell;
  /** Ближайший кусок литологии. */
  nearestLitPiece?: ProfileLitPiece;
}

/** Координаты скважины. */
interface WellPoint extends Point {
  WELL_ID: number;
}

/* --- --- */
