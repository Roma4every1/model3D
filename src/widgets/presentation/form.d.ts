/** Хранилище данных форм. */
type FormsState = FormDict<FormState>;

/** Идентификатор формы. */
type FormID = string;

/** Словарь типа `{ [formID]: data }`. */
type FormDict<Type = any> = Record<FormID, Type>;

/** Пропс с единственным полем `formID`. */
type PropsFormID = {formID: FormID};

/** Пропс для панелей редактирования. */
type FormEditPanelProps = {id: FormID, parentID: FormID};

/** Тип формы. */
type FormType = 'carat' | 'chart' | 'dataSet' | 'dock' | 'files' | 'filesList' |
  'grid' | 'image' | 'map' | 'multiMap' | 'model3D' | 'profile' |
  'slide' | 'spreadsheet' | 'spreadsheetUnite' | 'transferForm';

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

/** ### Состояние дочерних форм.
 * + `id`: {@link FormID} — ID родителя
 * + `children`: {@link FormDataWMR}[] — данные дочерних форм
 * + `openedChildren`: {@link FormID}[] — открытые формы
 * + `activeChildren`: {@link FormID}[] — активные формы
 * @example
 * {
 *   id: "1234", children: [{...}, {...}, {...}],
 *   openedChildren: ["1234,5678"], activeChildren: ["1234,5678"],
 * }
 * */
interface FormChildrenState {
  id: FormID,
  children: FormDataWMR[],
  openedChildren: FormID[],
  activeChildren: FormID[],
}

/* --- Form State --- */

/** Состояние формы.
 * + `id`: {@link FormID}
 * + `parent`: {@link FormID}
 * + `type`: {@link FormType}
 * + `settings`: {@link FormSettings}
 * + `channels`: {@link ChannelName}[]
 * */
interface FormState {
  /** ID формы. */
  id: FormID,
  /** ID родителя. */
  parent: FormID,
  /** Тип формы. */
  type: FormType,
  /** Настройки формы. */
  settings: FormSettings,
  /** Список ID каналов формы. */
  channels: ChannelName[],
}

/** Настройки формы. */
type FormSettings = any | ChartFormSettings | {};
