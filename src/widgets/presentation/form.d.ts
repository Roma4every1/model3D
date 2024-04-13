/** Словарь типа `{ [formID]: data }`. */
type FormDict<Type = any> = Record<FormID, Type>;
/** Хранилище данных форм. */
type FormStates = FormDict<FormState>;

/** Состояние формы.
 * + `id`: {@link FormID}
 * + `parent`: {@link ClientID}
 * + `type`: {@link FormType}
 * + `settings`: {@link FormSettings}
 * + `channels`: {@link ChannelName}[]
 * */
interface FormState {
  /** ID формы. */
  id: FormID;
  /** ID родителя. */
  parent: ClientID;
  /** Тип формы. */
  type: FormType;
  /** Настройки формы. */
  settings: FormSettings;
  /** Список прикреплённых каналов формы. */
  channels: AttachedChannel[];
}

/** Настройки формы. */
type FormSettings = any | ChartFormSettings | Record<string, never>;

/** Модель прикреплённого канала.
 * + `name`: {@link ChannelName}
 * + `attachOption`: {@link AttachOptionType}
 * + `exclude: string[]`
 * + `columnInfo`: {@link ChannelColumnInfo}
 * */
interface AttachedChannel {
  /** Название канала. */
  name: ChannelName;
  /** Тип присоединения свойств канала.  */
  attachOption: AttachOptionType;
  /** Список исключений присоединения. */
  exclude: string[];
  /** Дополнительная информация о колонках. */
  columnInfo?: ChannelColumnInfo;
}

/** Опция присоединения свойств колонок таблицы.
 * + `AttachAll` — все, кроме указанных в `exclude`
 * + `AttachNothing` — только те, что указанны в `exclude`
 * */
type AttachOptionType = 'AttachAll' | 'AttachNothing';

/** Идентификатор формы. */
type FormID = string;
/** Идентификатор презентации или формы. */
type ClientID = string;

/* --- --- --- */

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
  /** Все существующие наборы параметров на момент создания. */
  parameters: ParamDict;
  /** Все существующие каналы на момент создания. */
  channels: ChannelDict;
}

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
  /** ID родительской презентации. */
  id: ClientID;
  /** Данные дочерних форм. */
  children: FormDataWM[];
  /** Отображаемые дочерние формы. */
  openedChildren: FormID[];
  /** Активные дочерние формы. */
  activeChildren: FormID[];
}

/** Пропс для панелей редактирования. */
interface FormEditPanelProps {
  /** ID формы. */
  id: FormID;
  /** ID родительской презентации. */
  parentID: ClientID;
}

/** Тип формы. */
type FormType = 'dock' | 'grid' | 'dataSet' | 'carat' | 'chart' | 'map' | 'multiMap' |
  'files' | 'filesList' | 'image' | 'model3D' | 'profile' | 'slide' | 'spreadsheet' |
  'spreadsheetUnite' | 'transferForm';

/** Поддерживаемые типы форм. */
type SupportedFormType = 'dataSet' | 'carat' | 'chart' | 'map' | 'profile' | 'files' | 'filesList';
