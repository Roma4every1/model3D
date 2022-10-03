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
}

/** Параметр формы. */
interface FormParameter {
  id: ParameterID,
  type: ParameterType,
  value: any,
  formId?: FormID,
  editorType?: ParameterEditorType,
  editorDisplayOrder?: ParameterOrder,
  externalChannelName?: ChannelName,
  displayName?: string,
  dependsOn?: ParameterDepends,
  canBeNull?: boolean,
  showNullValue?: boolean,
  nullDisplayValue?: any,
}

/** Идентификатор формы. */
type FormID = string;

/** Идентификатор канала с данными. */
type ChannelName = string;

/** Идентификатор параметра формы.
 * @see FormParameter
 * */
type ParameterID = string;

/** Тип параметра формы.
 * @see FormParameter
 * */
type ParameterType = string;

/** Тип редактора для данного параметра.
 * @see FormParameter
 * */
type ParameterEditorType = string;

/** Влияет на то, в каком порядке отображать редакторы параметров.
 * @see FormParameter
 * */
type ParameterOrder = number;

/** Список параметров (ID), которые зависят от данного.
 * @see FormParameter
 * */
type ParameterDepends = ParameterID[];

/** Тип формы. */
type FormType = 'carat' | 'chart' | 'dataSet' | 'dock' | 'files' | 'filesList' | 'grid' | 'image' | 'map' |
  'model3D' | 'profile' | 'screenshot' | 'slide' | 'spreadsheet' | 'spreadsheetUnite' | 'transferForm';

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

/* --- Custom Request --- */

/** ## Well Manager API Request.
 *
 * Кастомный объект запроса.
 * + `method?`: {@link ReqMethod} — метод запроса
 * + `path`: {@link ReqPath} — относительный путь
 * + `query?`: {@link ReqQuery} — параметры
 * + `body?`: {@link ReqBody} — тело запроса
 * + `mapper?`: {@link ReqMapper} — тип обработчика
 * */
interface WRequest {
  method?: ReqMethod,
  path: ReqPath,
  query?: ReqQuery,
  body?: ReqBody,
  mapper?: ReqMapper
}

/** Метод HTTP запроса. */
type ReqMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** Относительный путь HTTP запроса. */
type ReqPath = string;

/** Параметры поиска HTTP запроса.
 * @example
 * { sessionID: "...", formID: "..." }
 * */
type ReqQuery = {[key: string]: string};

/** Тело HTTP запроса. */
type ReqBody = string;

/** Тип преобразователя ответа.
 * @example
 * "json" — .then(res => res.json())
 * "text" — .then(res => res.text())
 * */
type ReqMapper = 'json' | 'text';
