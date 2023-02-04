// noinspection LanguageDetectionInspection

interface RootFormState {
  id: FormID,
  settings: DockFormSettings,
  children: FormChildrenState,
  parameters: FormParameter[],
  presentations: PresentationItem[],
}

interface FormProps {
  formID: FormID,
  channels: ChannelName[],
}

/** Пропс с единственным полем `formID`. */
type PropsFormID = {formID: FormID};

/** Словарь типа `{ [formID]: data }`. */
type FormDict<Type = any> = {[key: FormID]: Type};

/** Данные формы.
 * + `id`: {@link FormID} — идентификатор
 * + `type`: {@link FormType} — тип
 * + `displayName: string` — заголовок
 * + `displayNameString: string` — паттерн заголовка
 * @example
 * { id: "...", type: "map", displayName: "Карта" }
 * */
interface FormDataWMR {
  id: FormID,
  type: FormType,
  displayName: string,
  displayNameString?: string,
  displayNamePattern?: any,
}

/** Идентификатор формы. */
type FormID = string;

/** Идентификатор канала с данными. */
type ChannelName = string;

/** Тип формы. */
type FormType = 'carat' | 'chart' | 'dataSet' | 'dock' | 'files' | 'filesList' |
  'grid' | 'image' | 'map' | 'multiMap' | 'model3D' | 'profile' |
  'slide' | 'spreadsheet' | 'spreadsheetUnite' | 'transferForm';

/** Число для сортировки каких-либо элементов. */
type Order = number;

type IconPath = string;
type ImagesDict<Items extends string = string> = Record<Items, IconPath>;

/* --- Fetch State --- */

/** ## Состояние загружаемых данных.
 * + `loading`: {@link IsLoading} — загрузилось ли
 * + `success`: {@link IsLoadedSuccessfully} — успешно ли
 * + `data: Type` — загруженные данные
 * @example
 * { loading: true, success: undefined, data: null } // загружается...
 * { loading: false, success: true, data: ... }      // успешная загрузка
 * { loading: false, success: false, data: ... }     // неудачная загрузка
 * @see AppState
 * */
type FetchState<Type> = FetchStateSuccess<Type> | FetchStateError | FetchStateAwait;

/** Состояние успешной загрузки. */
interface FetchStateSuccess<Type> {
  loading: false,
  success: true,
  data: Type,
}

/** Состояние неудачной загрузки. */
interface FetchStateError {
  loading: false,
  success: false,
  data: string,
}

/** Состояние перед загрузкой. */
interface FetchStateAwait {
  loading: IsLoading,
  success: undefined,
  data: null,
}

/** Находятся ли данные в состоянии загрузки.
 * @see FetchState
 * */
type IsLoading = boolean;

/** Является ли загрузка успешной.
 * @example
 * true      // загрузка прошла успешно
 * false     // загрузка прошла неудачно
 * undefined // данные ещё не загружены
 * @see FetchState
 * */
type IsLoadedSuccessfully = boolean | undefined;

/* --- Session Manager --- */

/** Менеджер сессии. */
interface SessionManager {
  paramsManager: ParamsManager,
  channelsManager: ChannelsManager,

  startSession(isDefault?: boolean): Promise<Res<SessionID>>
  stopSession(): Promise<void>
  saveSession(): Promise<void>
  loadSessionByDefault(): Promise<void>
  watchReport(operationID: any): void
}

/** Менеджер параметров. */
interface ParamsManager {
  loadFormParameters(formID: FormID, force: boolean): Promise<any>
  loadFormSettings(formID: FormID, force?: boolean): Promise<FormSettings>

  getCanRunReport(formID: FormID): Promise<void>
  getParameterValues(ids: ParameterID[], formID: FormID, addToLocal: any, channelName?: ChannelName): any
  updateParamSet(formID: FormID, newParamValues: any): void
}

/** Менеджер каналов. */
interface ChannelsManager {
  getAllChannelParams(channelName: ChannelName): any[]
  loadFormChannelsList(formID: FormID): Promise<ChannelName[]>
  loadAllChannelData(channelName: ChannelName, formID: FormID, force?: boolean): Promise<boolean>
  setFormInactive(formID: FormID): void
  reset(): void

  getNewRow(tableID: string): Promise<ChannelRow | null>
  insertRow(tableID: string, rows: ChannelRow[]): Promise<boolean>
  updateRow(tableID: string, ids: number[], rows: ChannelRow[]): Promise<boolean>
  deleteRows(tableID: string, indexes: number[], all: boolean): Promise<boolean>
  updateTables(modifiedTables: any, baseChannelName: ChannelName): Promise<void>
}
