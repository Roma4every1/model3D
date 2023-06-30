/** Активные объекты.
 * + `place`: {@link PlaceState} — месторождения
 * + `well`: {@link WellState} — скважины
 * + `trace`: {@link TraceState} — трассы
 * */
interface ObjectsState {
  /** Месторождения. */
  place: PlaceState,
  /** Скважины. */
  well: WellState,
  /** Трассы. */
  trace: TraceState,
}

/* --- Place --- */

/** Состояние активного месторождения.
 * + `channelName`: {@link ChannelName}
 * + `parameterID`: {@link ParameterID}
 * + `current`: {@link PlaceModel}
 * */
interface PlaceState {
  /** Название канала с месторождениями. */
  channelName: ChannelName,
  /** Идентификатор параметра месторождения. */
  parameterID: ParameterID | null,
  /** Текущее активное месторождение. */
  model: PlaceModel | null,
}

/** Модель месторождения.
 * + `id`: {@link PlaceID} — идентификатор
 * + `name`: {@link PlaceName} — название
 * */
interface PlaceModel {
  /** Идентификатор месторождения. */
  id: PlaceID,
  /** Название месторождения. */
  name: PlaceName,
}

/** Идентификатор месторождения. */
type PlaceID = number;
/** Название месторождения. */
type PlaceName = string;

/* --- Well --- */

/** Состояние активной скважины.
 * + `channelName`: {@link ChannelName}
 * + `parameterID`: {@link ParameterID}
 * + `current`: {@link WellModel}
 * */
interface WellState {
  /** Название канала со скважинами. */
  channelName: ChannelName,
  /** Идентификатор параметра скважины. */
  parameterID: ParameterID | null,
  /** Текущая активная скважина. */
  model: WellModel | null,
}

/** Модель скважины.
 * + `id`: {@link WellID} — идентификатор
 * + `name`: {@link WellName} — название
 * */
interface WellModel {
  /** Идентификатор скважины. */
  id: WellID,
  /** Название скважины. */
  name: WellName,
}

/** Идентификатор скважины (`UWID`). */
type WellID = number;
/** Название скважины. */
type WellName = string;

/* --- Trace --- */

/** Состояние активной трассы.
 * + `channelName`: {@link ChannelName}
 * + `nodeChannelName`: {@link ChannelName}
 * + `parameterID`: {@link ParameterID}
 * + `current`: {@link TraceModel}
 * + `creating: boolean`
 * + `editing: boolean`
 * */
interface TraceState {
  /** Название канала с трассами. */
  channelName: ChannelName,
  /** Название канала с узлами трасс. */
  nodeChannelName: ChannelName,
  /** Идентификатор параметра с трассами. */
  parameterID: ParameterID | null,
  /** Текущая активная трасса. */
  model: TraceModel | null,
  /** Модель трассы до внесения изменений. */
  oldModel: TraceModel,
  /** Создаётся ли трасса. */
  creating: boolean,
  /** Является ли активная трасса редактируемой. */
  editing: boolean,
}

/** Модель трассы.
 * + `id`: {@link TraceID} — идентификатор
 * + `place`: {@link PlaceID} — месторождение
 * + `name`: {@link TraceName} — название
 * + `nodes`: {@link TraceNode}[] — список узлов
 * */
interface TraceModel {
  /** Идентификатор трассы. */
  id: TraceID,
  /** Идентификатор месторождения. */
  place: PlaceID,
  /** Название трассы. */
  name: TraceName,
  /** Список узлов трассы. */
  nodes: TraceNode[],
}

/** Узел трассы. */
interface TraceNode {
  /** Идентификатор узла. */
  id: WellID,
  /** Название узла. */
  name: WellName,
  /** Координата узла по X. */
  x: number,
  /** Координата узла по Y. */
  y: number,
}

/** Идентификатор трассы. */
type TraceID = number;
/** Название трассы. */
type TraceName = string;
