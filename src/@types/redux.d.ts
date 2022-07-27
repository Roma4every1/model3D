/* --- state.appState --- */

/** Состояние, необходимое для компонента `SystemRouter`. */
type AppState = {
  config: LoadingState<ClientConfiguration>,
  systemList: LoadingState<SystemList>,
  sessionID: LoadingState<SessionID>,
  systemID: SystemID,
}

/** Состояние загрузки. */
type LoadingState<Type> = {
  loaded: boolean,
  success: boolean | undefined,
  data: Type
};

/** Клиентская конфигурация WMR. */
type ClientConfiguration = {webServicesURL: string};

/** Список информационных систем. */
type SystemList = WMWSystem[];

/** Информационная система WellManager. */
interface WMWSystem {
  id: string,
  displayName: string,
  displayNameShort?: string,
  description?: string,
  color?: string,
}

/** ID текущей системы. */
type SystemID = string;


/* --- state.canRunReport --- */

/** Можно ли отправить репорт. */
type CanRunReport = boolean;


/* --- state.channelsData --- */

/** Данные каналов. */
type ChannelsData = {[key: ChannelName]: any};


/* --- state.channelsLoading --- */

/** Данные о загрузке каналов. */
type ChannelsLoading = {[key: ChannelName]: {loading: IsChannelLoading}};

/** Загружается ли канал. */
type IsChannelLoading = boolean;


/* --- state.childForms --- */

/** Дочерние формы. */
type ChildForms = {[key: FormID]: any};


/* --- state.formParams --- */

/** Параметры форм. */
type FormParams = {[key: FormID]: any};


/* --- state.formRefs --- */

/** Ссылки на формы. */
type FormRefs = {[key: FormID]: any};


/* --- state.formSettings --- */

/** Настройки форм. */
type FormSettings = {[key: FormID]: any};


/* --- state.formStates --- */

/** Состояния форм. */
type FormStates = {[key: FormID]: FormState};

type FormState = {[key: ParameterID]: ParamState};

/** Состояние параметра:
 * + value — текущее значение параметра
 * + setValue — функция изменения параметров формы (из хука useState)
 * @see FormState
 * */
interface ParamState<Type> {
  value: Type,
}


/* --- state.layout --- */

/** Макеты форм. */
type FormsLayout = {[key: FormID]: any};

/* --- state.plugins --- */

//TODO: типизация


/* --- state.reports --- */

//TODO: типизация


/* --- state.sessionId --- */

/** Идентификатор сессии. */
type SessionID = string;


/* --- state.sessionManager --- */

//TODO: типизация


/* --- state.windowData --- */

//TODO: типизация
