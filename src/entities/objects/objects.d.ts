/** Активные объекты.
 * + `place`: {@link PlaceState} — месторождение
 * + `stratum`: {@link StratumState} — пласт
 * + `well`: {@link WellState} — скважина
 * + `trace`: {@link TraceState} — трасса
 * */
interface ObjectsState {
  /** Месторождение. */
  place: PlaceState;
  /** Пласт. */
  stratum: StratumState;
  /** Скважин. */
  well: WellState;
  /** Трасса. */
  trace: TraceState;
}

/* --- Place --- */

/** Состояние активного месторождения.
 * + `channelName`: {@link ChannelName}
 * + `parameterID`: {@link ParameterID}
 * + `model`: {@link PlaceModel}
 * */
interface PlaceState {
  /** Название канала с месторождениями. */
  channelName: ChannelName | null;
  /** Идентификатор параметра месторождения. */
  parameterID: ParameterID | null;
  /** Текущее активное месторождение. */
  model: PlaceModel | null;
}

/** Модель месторождения.
 * + `id`: {@link PlaceID} — идентификатор
 * + `name`: {@link PlaceName} — название
 * */
interface PlaceModel {
  /** Идентификатор месторождения. */
  id: PlaceID;
  /** Название месторождения. */
  name: PlaceName;
}

/** Идентификатор месторождения. */
type PlaceID = number;
/** Название месторождения. */
type PlaceName = string;

/* --- Stratum --- */

/** Состояние активного пласта.
 * + `channelName`: {@link ChannelName}
 * + `parameterID`: {@link ParameterID}
 * + `current`: {@link StratumModel}
 * */
interface StratumState {
  /** Название канала с пластами. */
  channelName: ChannelName | null;
  /** Идентификатор параметра пласта. */
  parameterID: ParameterID | null;
  /** Текущий активный пласт. */
  model: StratumModel | null;
}

/** Модель пласта.
 * + `id`: {@link StratumID} — идентификатор
 * + `name`: {@link StratumName} — название
 * */
interface StratumModel {
  /** Идентификатор пласта. */
  id: StratumID;
  /** Название пласта. */
  name: StratumName;
}

/** Идентификатор пласта. */
type StratumID = number;
/** Название пласта. */
type StratumName = string;

/* --- Well --- */

/** Состояние активной скважины.
 * + `channelName`: {@link ChannelName}
 * + `parameterID`: {@link ParameterID}
 * + `model`: {@link WellModel}
 * */
interface WellState {
  /** Название канала со скважинами. */
  channelName: ChannelName | null;
  /** Идентификатор параметра скважины. */
  parameterID: ParameterID | null;
  /** Текущая активная скважина. */
  model: WellModel | null;
}

/** Модель скважины.
 * + `id`: {@link WellID} — идентификатор
 * + `name`: {@link WellName} — название
 * */
interface WellModel {
  /** Идентификатор скважины. */
  id: WellID;
  /** Название скважины. */
  name: WellName;
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
 * + `model`: {@link TraceModel}
 * + `oldModel`: {@link TraceModel}
 * + `creating: boolean`
 * + `editing: boolean`
 * */
interface TraceState {
  /** Название канала с трассами. */
  channelName: ChannelName | null;
  /** Название канала с узлами трасс. */
  nodeChannelName: ChannelName | null;
  /** Идентификатор параметра с трассами. */
  parameterID: ParameterID | null;
  /** Текущая активная трасса. */
  model: TraceModel | null;
  /** Модель трассы до внесения изменений. */
  oldModel: TraceModel | null;
  /** Создаётся ли трасса. */
  creating: boolean;
  /** Является ли активная трасса редактируемой. */
  editing: boolean;
}

/** Модель трассы.
 * + `id`: {@link TraceID} — идентификатор
 * + `place`: {@link PlaceID} — месторождение
 * + `name`: {@link TraceName} — название
 * + `nodes`: {@link TraceNode}[] — список узлов
 * */
interface TraceModel {
  /** Идентификатор трассы. */
  id: TraceID;
  /** Идентификатор месторождения. */
  place: PlaceID;
  /** Название трассы. */
  name: TraceName;
  /** Список узлов трассы. */
  nodes: TraceNode[];
}

/** Узел трассы. */
interface TraceNode {
  /** Идентификатор узла. */
  id: WellID;
  /** Название узла. */
  name: WellName;
  /** Координата узла по X. */
  x: number;
  /** Координата узла по Y. */
  y: number;
}

/** Идентификатор трассы. */
type TraceID = number;
/** Название трассы. */
type TraceName = string;
