/** Состояние презентаций. */
type PresentationDict = Record<ClientID, PresentationState>;

/** Состояние презентации.
 * + `id`: {@link ClientID}
 * + `layout: Model`
 * + `settings`: {@link PresentationSettings}
 * + `children`: {@link FormDataWM}[]
 * + `childrenTypes`: {@link ClientType}[]
 * + `activeChildID`: {@link FormID}
 * */
interface PresentationState {
  /** ID презентации. */
  id: ClientID;
  /** Разметка */
  layout: any; // Model из 'flex-layout-react'
  /** Настройки презентации. */
  settings: PresentationSettings;
  /** Прикреплённые каналы. */
  channels: AttachedChannel[];
  /** Дочерние формы. */
  children: FormDataWM[];
  /** Список всех типов форм внутри презентации. */
  childrenTypes: Set<ClientType>;
  /** Отображаемые дочерние формы. */
  openedChildren: FormID[];
  /** Активная формы */
  activeChildID: FormID;
}

/** Настройки презентации.
 * + `multiMapChannel?: boolean`
 * + `linkedProperties?`: {@link ParameterSetter}[]
 * + `parameterGroups?`: {@link ParameterGroup}[]
 * */
interface PresentationSettings {
  /** `true`, если презентация это мультикарта. */
  multiMapChannel?: boolean;
  /** Данные о параметрах, которые должны автоматически обновляться. */
  linkedProperties?: ParameterSetter[];
  /** Группы параметров для разбиения списка на вкладки. */
  parameterGroups?: ParameterGroup[];
}

/** Настройка, которая обновляет значение параметра презентации при изменении глобальных. */
interface ParameterSetter {
  /** Параметр, значение которого нужно обновить. */
  parameterToSet: ParameterID;
  /** Параметры, значения которых нужно будет передать в запрос `/executeReportProperty`. */
  parametersToExecute: ParameterID[];
  /** Индекс, который нужно будет передать в запрос `/executeReportProperty`. */
  index: number;
}
