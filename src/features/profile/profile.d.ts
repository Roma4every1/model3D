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

/** Порт просмотра. */
interface ProfileViewport {
  /** Координата начала вьюпорта по X. */
  startX: number;
  /** Координата начала вьюпорта по Y. */
  startY: number;
  /** Текущая координата по X. */
  currentX: number;
  /** Текущая координата по Y. */
  currentY: number;
  currentMaxX: number;
  currentMaxY: number;
  /** Ширина области просмотра. */
  width: number;
  /** Высота области просмотра. */
  height: number;
  /** Минимально возможная координата по X. */
  minX: number;
  /** Максимально возможная координата по X. */
  maxX: number;
  /** Минимально возможная координата по Y. */
  minY: number;
  /** Максимально возможная координата по Y. */
  maxY: number;
}

/** Загрузчик данных профиля. */
interface IProfileLoader {
  flag: number;
  cache: ProfileDataCache;

  setLoading: (l: Partial<CaratLoading>) => void;
  loadProfileData(formID: FormID, trace: TraceModel, channels: ChannelDict);
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

/** Кэш данных профиля. */
interface ProfileDataCache {
  xAxisSettings: ProfileXAxisSettings;
  yAxisSettings: ProfileYAxisSettings;
  inclinometryData: ProfileInclDataMap;
  lithologyData: ProfileLithologyPointsMap;
  plastsLinesData: ProfilePlastDataMap;
}

/** Данные пласта профиля. */
type ProfilePlastDataMap = Map<number, ProfilePlastData>;

interface ProfilePlastData {
  maxThickness: number;
  borderLine: ProfileLineData;
}

/** Данные линии профиля. */
type ProfileLineData = ProfileLinePoint[];

/** Точка линии профиля. */
interface ProfileLinePoint {
  x: number;
  y: number;
  distance: number;
  topAbsMark: number;
  baseAbsMark;
}

/** Конфиг отрисовщика профиля. */
interface ProfileDrawerConfig {
  /** Глобальные настройки. */
  stage: {
    /** Величина отступов вокруг треков. */
    padding: number,
    /** Глобальные настройки шрифта сцены. */
    font: CSSFont,
  },
  /** Настройки осей. */
  axis: {
    /** Цвет заднего фона осей. */
    backgroundColor: ColorHEX,
    /** Цвет горизонтальной пометки и подписи. */
    color: ColorHEX,
    /** {@link CSSFont} подписей. */
    font: Partial<CSSFont>,
    /** Базовый азмер пометки. */
    markSize: number,
  },
}

/** Класс для управления инклинометрией профиля. */
interface IProfileIncl {

}

type ProfileTopBaseFieldsMap = Map<number, TopBaseMapsDataRaw[]>;

type ProfileInclDataMap = Map<number, ProfileWellIncl>;

type ProfileLithologyPointsMap = Map<number, ProfileLitPoint[]>

interface ProfileLitPoint {
  absMark: number;
  distance: number;
  lithology: ProfileLitPiece
}

interface ProfileWellIncl {
  WELL_ID: number;
  ustX: number;
  ustY: number;
  ustDistance: number;
  inclPoints: ProfileWellInclPoint[];
}

interface ProfileWellInclPoint {
  x: number;
  y: number;
  distance: number;
  absValue: number;
  depth: number;
}

interface TopBaseMapsDataRaw {
  plastCode: number;
  mapType: string;
  containerData: MapField;
}

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

/** Отрисовщик профиля. */
interface IProfileDrawer {
  setYAxisSettings(settings: any);
  setXAxisSettings(settings: any);
  setContext(context: CanvasRenderingContext2D);
  render(plastDataMap: ProfilePlastDataMap, inclData: ProfileInclDataMap)
}

interface TraceLineData {
  startNode: UstPoint;
  endNode: UstPoint;
  points: TracePoint[];
  remainder: number;
  distance: number;
}

interface TraceLinesData {
  points: TracePoint[];
  distance: number;
  additionalWells: UstPoint[];
}

interface TracePoint extends UstPoint {
  distance: number;
}

interface UstPoint extends Point {
  WELL_ID: number;
}
