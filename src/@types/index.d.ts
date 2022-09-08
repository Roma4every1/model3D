/** Параметр формы. */
interface FormParameter {
  id: ParameterID,
  type: ParameterType,
  value: any,
  formId: FormID,
  editorType: ParameterEditorType,
  editorDisplayOrder: ParameterOrder,
  externalChannelName: ChannelName,
  displayName: string,
  dependsOn: ParameterDepends,
  canBeNull: boolean,
  showNullValue: boolean,
  nullDisplayValue: any,
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

type FormDict<Type> = {[key: FormID]: Type};

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
