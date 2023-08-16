/** Хранилище данных форм. */
type FormStates = FormDict<FormState>;

/** Идентификатор формы. */
type FormID = string;
/** Идентификатор презентации или формы. */
type ClientID = string;

/** Словарь типа `{ [formID]: data }`. */
type FormDict<Type = any> = Record<ClientID, Type>;

/** Пропс с единственным полем `formID`. */
type PropsFormID = {formID: FormID};

/** Пропс для панелей редактирования. */
type FormEditPanelProps = {id: FormID, parentID: ClientID};

/** Тип формы. */
type FormType = 'carat' | 'chart' | 'dataSet' | 'dock' | 'files' | 'filesList' |
  'grid' | 'image' | 'map' | 'multiMap' | 'model3D' | 'profile' |
  'slide' | 'spreadsheet' | 'spreadsheetUnite' | 'transferForm';

/** Поддерживаемые типы форм. */
type SupportedFormType = 'dataSet' | 'carat' | 'chart' | 'map';

/** Данные формы.
 * + `id`: {@link FormID}
 * + `type`: {@link FormType}
 * + `displayName`: {@link DisplayName}
 * + `displayNameString: string`
 * */
interface FormDataWM {
  /** Идентификатор формы. */
  id: FormID;
  /** Тип формы. */
  type: FormType;
  /** Имя, отображаемое на уровне интерфейса. */
  displayName: DisplayName;
  /** Шаблон динамического имени формы. */
  displayNameString?: string;
  /** Паттерн динамического имени формы. */
  displayNamePattern?: any;
}

/** Состояние дочерних форм.
 * + `id`: {@link ClientID}
 * + `children`: {@link FormDataWM}[]
 * + `openedChildren`: {@link FormID}[]
 * + `activeChildren`: {@link FormID}[]
 * */
interface FormChildrenState {
  /** ID родителя (презентации). */
  id: ClientID;
  /** Данные дочерних форм. */
  children: FormDataWM[];
  /** Отображаемые дочерние формы. */
  openedChildren: FormID[];
  /** Активные дочерние формы. */
  activeChildren: FormID[];
}

/* --- Form State --- */

/** Объект с данными для создания новой формы.
 * + `state`: {@link FormState}
 * + `settings`: {@link FormSettings}
 * + `objects`: {@link ObjectsState}
 * + `parameters`: {@link ParamDict}
 * + `channels`: {@link ChannelDict}
 * */
interface FormStatePayload {
  /** Базовая информация о форме. */
  state: FormState;
  /** Настройки формы. */
  settings: FormSettings;
  /** Состояние активных объектов. */
  objects: ObjectsState;
  /** Существующие наборы параметров на момент создания. */
  parameters: ParamDict;
  /** Существующие каналы на момент создания. */
  channels: ChannelDict;
}

/** Состояние формы.
 * + `id`: {@link FormID}
 * + `parent`: {@link FormID}
 * + `type`: {@link FormType}
 * + `settings`: {@link FormSettings}
 * + `channels`: {@link ChannelName}[]
 * */
interface FormState {
  /** ID формы. */
  id: FormID;
  /** ID родителя. */
  parent: FormID;
  /** Тип формы. */
  type: FormType;
  /** Настройки формы. */
  settings: FormSettings;
  /** Список ID каналов формы. */
  channels: ChannelName[];
}

/** Настройки формы. */
type FormSettings = any | ChartFormSettings | {};
