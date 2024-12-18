/** Менеджер активного объекта системы. */
interface ActiveObjectManager {
  /** Если объект существует в системе, менеджер активен. */
  activated(): boolean;
  /** По текущему значению параметров системы иницализирует модель объекта. */
  initializeModel(parameters: Parameter[], channels?: ChannelDict): void;
  /** Метод, который вызывается при обновлении параметров системы. */
  onParameterUpdate(value: any, channels?: ChannelDict): boolean;
}

/* --- Place --- */

/** Модель месторождения. */
interface PlaceModel {
  /** Идентификатор месторождения. */
  id: PlaceID;
  /** Строковый код месторождения. */
  code: string;
  /** Название месторождения. */
  name: string;
}

/** Идентификатор месторождения. */
type PlaceID = number;

/* --- Stratum --- */

/** Модель пласта. */
interface StratumModel {
  /** Идентификатор пласта. */
  id: StratumID;
  /** Название пласта. */
  name: string;
}

/** Идентификатор пласта. */
type StratumID = number;

/* --- Well --- */

/** Модель скважины. */
interface WellModel {
  /** Идентификатор скважины. */
  id: WellID;
  /** Название скважины. */
  name: string;
}

/** Идентификатор скважины. */
type WellID = number;

/* --- Trace --- */

/** Модель трассы. */
interface TraceModel {
  /** Идентификатор трассы. */
  id: TraceID;
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
type TraceNodeChannelFields = (keyof Omit<TraceNode, 'name'>) | 'order';

/* --- Site --- */

/** Состояние модели участка. */
interface SiteState {
  /** Текущий активный участок. */
  model: SiteModel | null;
  /** Модель участка до внесения изменений. */
  initModel: SiteModel | null;
  /** Текущий режим редактирования. */
  editMode: SiteEditMode | null;
}

/** Режим редактирования участка. */
type SiteEditMode =
  | 'site-append-point' | 'site-insert-point'
  | 'site-remove-point' | 'site-move-point';

/** Модель участка. */
interface SiteModel {
  /** Идентификатор. */
  id: SiteID;
  /** Название. */
  name: string;
  /** Опорные точки. */
  points: Point[];
}

/** Идентификатор участка. */
type SiteID = number;
