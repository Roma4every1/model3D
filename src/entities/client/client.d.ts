/** Идентификатор презентации или формы. */
type ClientID = string;
/** Идентификатор формы. */
type FormID = string;

/** Тип клиента сессии. */
type ClientType =
  | 'dock' | 'grid' | 'dataSet' | 'carat' | 'chart' | 'map' | 'multiMap'
  | 'files' | 'filesList' | 'image' | 'model3D' | 'profile' | 'slide' | 'spreadsheet';

/** Поддерживаемые типы форм. */
type SupportedFormType =
  'dataSet' | 'carat' | 'chart' | 'map' | 'profile' | 'files' | 'filesList' | 'slide';

/** Состояния клиентов сессии. */
type ClientStates = Record<ClientID, SessionClient>;

/** Клиент сессии. */
interface SessionClient<T extends ClientType = ClientType, S = any, L = any> {
  /** Уникальный идентификатор. */
  readonly id: ClientID;
  /** Тип клиента. */
  readonly type: T;
  /** Идентификатор родительского клиента. */
  readonly parent: ClientID;
  /** ID параметров клиента. */
  readonly parameters: ParameterID[];
  /** Прикреплённые каналы. */
  channels: AttachedChannel[];
  /** Настройки, характерные для типа. */
  settings?: S;
  /** Любая дополнительная конфигурация произвольной структуры. */
  extra?: any; // XElement
  /** Модель разметки. */
  layout?: L;
  /** Дочерние клиенты. */
  children?: FormDataWM[];
  /** Отображаемые дочерние клиенты. */
  openedChildren?: Set<FormID>;
  /** Активный дочерний клиент. */
  activeChildID?: FormID;
  /** Типы дочерних клиентов. */
  childrenTypes?: ReadonlySet<ClientType>;
  /** Каналы, которые должны быть обновлены для показа формы. */
  neededChannels?: ChannelID[];
  /** Состояние загрузки. */
  loading?: ClientLoadingState;
}

/** Состояние загрузки презентации или формы. */
interface ClientLoadingState {
  /** Статус загрузки. */
  status: ClientLoadingStatus;
  /** Сообщение ошибки. */
  error?: string;
}

/**
 * Статус загрузки клиента сессии.
 * + `init` — инициализация состояния
 * + `data` — загрузка данных
 * + `done` — загрузка успешно завершена
 * + `error` — при загрузке произошла ошибка
 */
type ClientLoadingStatus = 'init' | 'data' | 'done' | 'error';

/** DTO дочерних элементов клиента сессии. */
interface ClientChildrenDTO {
  /** Данные дочерних форм. */
  children: FormDataWM[];
  /** Отображаемые дочерние формы. */
  openedChildren: ClientID[];
  /** Активные дочерние формы. */
  activeChildren: ClientID[];
}

/** Данные формы. */
interface FormDataWM {
  /** Идентификатор формы. */
  readonly id: FormID;
  /** Тип формы. */
  readonly type: ClientType;
  /** Имя, отображаемое на уровне интерфейса. */
  displayName: string;
  /** Шаблон динамического `displayName`. */
  displayNameString?: any; // ParameterStringTemplate
}

/* --- Channels --- */

/** Критерии подключаемых каналов к клиенту. */
type ClientChannelCriteria<T = string> = Record<T, ChannelCriterion>;

/** Данные для создания прикреплённого канала. */
interface AttachedChannelDTO {
  /** Название канала. */
  name: ChannelName;
  /** Тип присоединения свойств канала.  */
  attachOption?: string;
  /** Список исключений присоединения. */
  exclude?: string[];
}

/* --- --- --- */

/** Объект с данными для создания новой формы. */
interface FormStatePayload<S = any> {
  /** Базовая информация о форме. */
  readonly state: SessionClient<ClientType, S>;
  /** Состояние активных объектов. */
  readonly objects: ObjectsState;
  /** Все существующие наборы параметров на момент создания. */
  readonly parameters: ParameterDict;
  /** Все существующие каналы на момент создания. */
  readonly channels: ChannelDict;
}

/** Пропс для панелей редактирования. */
interface FormRibbonProps {
  /** ID формы. */
  id: FormID;
  /** ID родительской презентации. */
  parentID: ClientID;
}
