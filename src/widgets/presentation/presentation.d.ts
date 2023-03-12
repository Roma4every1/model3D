/** Состояние презентаций. */
type PresentationDict = Record<FormID, PresentationState>;

/** Состояние презентации.
 * + `id`: {@link FormID}
 * + `layout: IJsonModel`
 * + `settings`: {@link GridFormSettings}
 * + `children`: {@link FormDataWMR}[]
 * + `childrenTypes`: {@link FormType}[]
 * + `activeChildID`: {@link FormID}
 * */
interface PresentationState {
  /** ID презентации. */
  id: FormID,
  /** Разметка */
  layout: any, // IJsonModel из 'flex-layout-react' (нельзя добавить в .d.ts)
  /** Настройки презентации. */
  settings: GridFormSettings,
  /** Дочерние формы. */
  children: FormDataWMR[],
  /** Список всех типов форм внутри презентации. */
  childrenTypes: Set<FormType>,
  /** Отображаемые дочерние формы. */
  openedChildren: FormID[],
  /** Активная формы */
  activeChildID: FormID,
}

/** Настройки формы **Grid**.
 * + `multiMapChannel: string | null`
 * */
interface GridFormSettings {
  /** Название канала с картами, в случае если презентация это мультикарта. */
  multiMapChannel: string | null,
  /** Группы параметров для разбиения списка на вкладки. */
  parametersGroups?: ParameterGroup[] | null,
}
