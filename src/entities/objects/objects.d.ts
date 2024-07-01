/** Активные объекты.
 * + `place`: {@link IPlaceManager} — месторождение
 * + `stratum`: {@link IStratumManager} — пласт
 * + `well`: {@link IWellManager} — скважина
 * + `trace`: {@link ITraceManager} — трасса
 */
interface ObjectsState {
  /** Месторождение. */
  place: IPlaceManager;
  /** Пласт. */
  stratum: IStratumManager;
  /** Скважин. */
  well: IWellManager;
  /** Трасса. */
  trace: ITraceManager;
}

/** Менеджер активного объекта системы. */
interface ActiveObjectManager<T> {
  /** Модель активного объекта. */
  model: T | null;
  /** Если объект существует в системе, менеджер активен. */
  activated(): boolean;
  /** По текущему значению параметров системы иницализирует модель объекта. */
  initializeModel(parameters: Parameter[], channels?: ChannelDict): void;
  /** Метод, который вызывается при обновлении параметров системы. */
  onParameterUpdate(value: any, channels?: ChannelDict): boolean;
}

/* --- Place --- */

/** Состояние активного месторождения. */
interface IPlaceManager extends ActiveObjectManager<PlaceModel> {
  /** Название канала с месторождениями. */
  channelName?: ChannelName;
  /** Идентификатор параметра месторождения. */
  parameterID?: ParameterID;
}

/** Модель месторождения.
 * + `id`: {@link PlaceID} — идентификатор
 * + `name: string` — название
 */
interface PlaceModel {
  /** Идентификатор месторождения. */
  id: PlaceID;
  /** Название месторождения. */
  name: string;
}

/** Идентификатор месторождения. */
type PlaceID = number;

/* --- Stratum --- */

/** Состояние активного пласта. */
interface IStratumManager extends ActiveObjectManager<StratumModel> {
  /** Название канала с пластами. */
  channelName?: ChannelName;
  /** Идентификатор параметра пласта. */
  parameterID?: ParameterID;
}

/** Модель пласта.
 * + `id`: {@link StratumID} — идентификатор
 * + `name: string` — название
 */
interface StratumModel {
  /** Идентификатор пласта. */
  id: StratumID;
  /** Название пласта. */
  name: string;
}

/** Идентификатор пласта. */
type StratumID = number;

/* --- Well --- */

/** Состояние активной скважины. */
interface IWellManager extends ActiveObjectManager<WellModel> {
  /** Название канала со скважинами. */
  channelName?: ChannelName;
  /** Название параметрка со скважинами. */
  parameterID?: ParameterID;
}

/** Модель скважины.
 * + `id`: {@link WellID} — идентификатор
 * + `name: string` — название
 */
interface WellModel {
  /** Идентификатор скважины. */
  id: WellID;
  /** Название скважины. */
  name: string;
}

/** Идентификатор скважины. */
type WellID = number;

/* --- Trace --- */

/** Состояние активной трассы. */
interface ITraceManager extends ActiveObjectManager<TraceModel> {
  /** Название канала с трассами. */
  channelName?: ChannelName;
  /** Название канала с узлами трасс. */
  nodeChannelName?: ChannelName;
  /** Идентификатор параметра с трассами. */
  parameterID?: ParameterID;
  /** Модель трассы до внесения изменений. */
  oldModel: TraceModel | null;
  /** Создаётся ли трасса. */
  creating: boolean;
  /** Является ли активная трасса редактируемой. */
  editing: boolean;

  clone(): ITraceManager;
  nodesChanged(): boolean;
  applyModelToChannelRow(traceChannel: Channel, row: ChannelRow): void;
  getNodeChannelRows(columns: ChannelColumn[]): ChannelRow[];
}

/** Модель трассы.
 * + `id`: {@link TraceID} — идентификатор
 * + `place`: {@link PlaceID} — месторождение
 * + `name: string` — название
 * + `nodes`: {@link TraceNode}[] — список узлов
 */
interface TraceModel {
  /** Идентификатор трассы. */
  id: TraceID;
  /** Идентификатор месторождения. */
  place: PlaceID;
  /** Название трассы. */
  name: string;
  /** Список узлов трассы. */
  nodes: TraceNode[];
}

/** Узел трассы. */
interface TraceNode {
  /** Идентификатор узла. */
  id: WellID;
  /** Название узла. */
  name: string;
  /** Координата узла по X. */
  x: number;
  /** Координата узла по Y. */
  y: number;
}

/** Идентификатор трассы. */
type TraceID = number;

/** Поля узла трассы в БД. */
type TraceNodeChannelFields = (keyof Omit<TraceNode, 'name'>) | 'traceID' | 'order';
