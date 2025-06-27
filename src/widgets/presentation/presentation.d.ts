/** Состояние презентации. */
type PresentationState = SessionClient<'grid', PresentationSettings>;

/** Настройки презентации. */
interface PresentationSettings {
  /** `true`, если презентация это мультикарта. */
  mapLayoutManager?: boolean;
  /** Группы параметров для разбиения списка на вкладки. */
  parameterGroups?: ParameterGroup[];
  /** Конфигурация окон со сводными формами. */
  windows?: Record<string, PresentationWindow>;
}

/** Модель окна со сводными формами. */
interface PresentationWindow {
  /** Идентификатор. */
  readonly name: string;
  /** Конфигурация окна. */
  readonly settings: PresentationWindowSettings;
  /** ID форм, которые содержит окно. */
  readonly formIDs: ReadonlySet<FormID>;
  /** Модель разметки. */
  readonly layout: any; // Model из FlexLayoutReact
  /** Колбэк для открытия окна. */
  open(initiator?: ClientID): void;
}

/** Конфигурация окна со сводными формами. */
interface PresentationWindowSettings {
  /** Заголовок окна. */
  readonly title?: string;
  /** Начальная ширина окна в процентах или пикселях. */
  readonly width?: string;
  /** Минимальная ширина окна в процентах или пикселях. */
  readonly minWidth?: string;
  /** Начальная высота окна в процентах или пикселях. */
  readonly height?: string;
  /** Минимальная высота окна в процентах или пикселях. */
  readonly minHeight?: string;
  /** Разрешено ли изменять размер окна. */
  readonly resizable?: boolean;
}
