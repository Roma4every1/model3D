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
  /** Устанваливает канвас сцены. */
  setCanvas(canvas: HTMLCanvasElement): void;
  /** Обновляет вид в соответствии с текущими размерами холста. */
  resize(): void;
  /** Устанавливает данные сцены профиля. */
  setData(cache: ProfileDataCache): void;
  /** Отрисовывает всю сцену профиля. */
  render(): void;
}

/** Отрисовщик профиля. */
interface IProfileDrawer {
  setYAxisSettings(settings: any);
  setXAxisSettings(settings: any);
  setContext(context: CanvasRenderingContext2D);
  render(linesData: ProfilePlastData[])
}

/** Загрузчик данных профиля. */
interface IProfileLoader {
  flag: number;
  cache: ProfileDataCache;

  setLoading: (l: Partial<CaratLoading>) => void;
  loadProfileData(formID: FormID, trace: TraceModel, topBaseMapsChannel: Channel);
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
  plastsLinesData: ProfilePlastData[];
}

/** Данные пласта профиля. */
type ProfilePlastData = ProfileLineData[];

/** Данные линии профиля. */
type ProfileLineData = ProfileLinePoint[];

/** Точка линии профиля. */
interface ProfileLinePoint {
  x: number;
  y: number;
  value: number;
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
