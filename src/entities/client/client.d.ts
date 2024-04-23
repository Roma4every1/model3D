/** Идентификатор презентации или формы. */
type ClientID = string;
/** Идентификатор формы. */
type FormID = string;

/** Тип клиента сессии. */
type ClientType = 'dock' | 'grid' | 'dataSet' | 'carat' | 'chart' | 'map' | 'multiMap' |
  'files' | 'filesList' | 'image' | 'model3D' | 'profile' | 'slide' | 'spreadsheet';

/** Поддерживаемые типы форм. */
type SupportedFormType = 'dataSet' | 'carat' | 'chart' | 'map' | 'profile' | 'files' | 'filesList';

/** Состояния клиентов сессии. */
type ClientStates = Record<ClientID, SessionClient>;

/** Клиент сессии. */
interface SessionClient<S = any, L = any> {
  /** Уникальный идентификатор. */
  id: ClientID;
  /** Тип клиента. */
  type: ClientType;
  /** Идентификатор родительского клиента. */
  parent: ClientID;
  /** Состояние дочерних клиентов. */
  children?: ClientChildren;
  /** Прикреплённые каналы к форме. */
  channels: AttachedChannel[];
  /** Настройки, характерные для типа. */
  settings?: S;
  /** Модель разметки. */
  layout?: L;
}

/* --- Children --- */

/** Состояние дочерних клиентов сессии. */
interface ClientChildren {
  data: FormDataWM[];
  opened: ClientID[];
  active: ClientID;
  types?: Set<ClientType>;
}

/** Дочерние элементы клиента сессии.
 * + `children`: {@link FormDataWM}[]
 * + `openedChildren`: {@link ClientID}[]
 * + `activeChildren`: {@link ClientID}[]
 * */
interface ClientChildrenDTO {
  /** Данные дочерних форм. */
  children: FormDataWM[];
  /** Отображаемые дочерние формы. */
  openedChildren: ClientID[];
  /** Активные дочерние формы. */
  activeChildren: ClientID[];
}

/** Данные формы.
 * + `id`: {@link FormID}
 * + `type`: {@link ClientType}
 * + `displayName`: string
 * + `displayNameString: string`
 * */
interface FormDataWM {
  /** Идентификатор формы. */
  id: FormID;
  /** Тип формы. */
  type: ClientType;
  /** Имя, отображаемое на уровне интерфейса. */
  displayName: string;
  /** Шаблон динамического `displayName`. */
  displayNameString?: any; // ParameterStringTemplate
}

/* --- Channels --- */

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

/* --- --- --- */

/** Объект с данными для создания новой формы.
 * + `state`: {@link SessionClient}
 * + `settings: S // зависит от типа`
 * + `objects`: {@link ObjectsState}
 * + `parameters`: {@link ParamDict}
 * + `channels`: {@link ChannelDict}
 * */
interface FormStatePayload<S = any> {
  /** Базовая информация о форме. */
  state: SessionClient<S>;
  /** Настройки формы. */
  settings: S;
  /** Состояние активных объектов. */
  objects: ObjectsState;
  /** Все существующие наборы параметров на момент создания. */
  parameters: ParamDict;
  /** Все существующие каналы на момент создания. */
  channels: ChannelDict;
}

/** Пропс для панелей редактирования. */
interface FormEditPanelProps {
  /** ID формы. */
  id: FormID;
  /** ID родительской презентации. */
  parentID: ClientID;
}
