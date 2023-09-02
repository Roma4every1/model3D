/** Состояние презентаций. */
type PresentationDict = Record<ClientID, PresentationState>;

/** Состояние презентации.
 * + `id`: {@link ClientID}
 * + `layout: Model`
 * + `settings`: {@link GridFormSettings}
 * + `children`: {@link FormDataWM}[]
 * + `childrenTypes`: {@link FormType}[]
 * + `activeChildID`: {@link FormID}
 * */
interface PresentationState {
  /** ID презентации. */
  id: ClientID;
  /** Разметка */
  layout: any; // Model из 'flex-layout-react'
  /** Настройки презентации. */
  settings: GridFormSettings;
  /** Дочерние формы. */
  children: FormDataWM[];
  /** Список всех типов форм внутри презентации. */
  childrenTypes: Set<FormType>;
  /** Отображаемые дочерние формы. */
  openedChildren: FormID[];
  /** Активная формы */
  activeChildID: FormID;
}

/** Настройки формы **Grid**.
 * + `multiMapChannel: string | null`
 * + `parameterGroups`: {@link ParameterGroup}[] | null
 * */
interface GridFormSettings {
  /** Название канала с картами, в случае если презентация это мультикарта. */
  multiMapChannel: string | null;
  /** Группы параметров для разбиения списка на вкладки. */
  parameterGroups?: ParameterGroup[] | null;
}
