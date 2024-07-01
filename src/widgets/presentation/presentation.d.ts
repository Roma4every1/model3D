/** Состояние презентации. */
type PresentationState = SessionClient<'grid', PresentationSettings>;

/** Настройки презентации. */
interface PresentationSettings {
  /** `true`, если презентация это мультикарта. */
  multiMapChannel?: boolean;
  /** Группы параметров для разбиения списка на вкладки. */
  parameterGroups?: ParameterGroup[];
}
