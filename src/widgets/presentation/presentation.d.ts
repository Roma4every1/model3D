/** Состояние презентаций. */
type PresentationsState = FormDict<PresentationState>;

/** Состояние презентации.
 * + `id`: {@link FormID}
 * + `layout: IJsonModel`
 * + `settings`: {@link GridFormSettings}
 * + `children`: {@link FormDataWMR}[]
 * + `childrenTypes`: {@link FormType}[]
 * + `activeChildID`: {@link FormID}
 * + `programs`: {@link ProgramListData}
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
  childrenTypes: FormType[],
  /** Активная формы */
  activeChildID: FormID,
  /** Список SQL-программ и отчётов. */
  programs: ProgramListData,
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
