/** Словарь параметров. */
type ParameterDict = Record<ClientID, Parameter[]>;

/** Идентификатор параметра. */
type ParameterID = number;
/** Название параметра в конфиге сессии. */
type ParameterName = string;

/** Тип параметра. */
type ParameterType = 'bool' | 'integer' | 'integerArray' | 'string' | 'stringArray' | 'double' |
  'doubleInterval' | 'date' | 'dateInterval' | 'tableCell' | 'tableCellsArray' | 'tableRow';

/** Необходимые свойства параметра для получения данных канала. */
interface SerializedParameter {
  /** Название параметра в конфиге сессии. */
  id: ParameterName;
  /** Тип параметра. */
  type: ParameterType | 'sortOrder';
  /** Сериализованное значение параметра. */
  value: string | null;
}

type ParameterMap = Map<ParameterID, Parameter>;
type PNameResolve = (name: ParameterName) => ParameterID | undefined;

/**
 * Колбэк, который вызывается при обновлении параметра системы.
 * Если в хранилище были внесены изменения, должно быть возвращено
 * множество параметров, которые были изменены.
 */
type OnParameterUpdate = (newValue: any, storage: ParameterMap) =>
  ParameterID | Set<ParameterID> | undefined;

interface Parameter<T extends ParameterType = ParameterType> {
  /** Идентификатор параметра. */
  id: ParameterID;
  /** Название параметра в конфиге сессии. */
  readonly name: ParameterName;
  /** Тип параметра. */
  readonly type: T;

  /** Допускается ли пустое значение параметра. */
  nullable?: boolean;
  /** Названия параметров, от которых зависит значение данного параметра. */
  dependsOn?: ParameterName[];
  /** ID всех параметров, значения которых зависят от данного параметра. */
  dependents?: ParameterID[];

  /** Настройки редактора. */
  editor?: ParameterEditorOptions;
  /** Название канала, из которого берутся данные для выбора значения. */
  channelName?: ChannelName;

  /** Получить значение параметра. */
  getValue(): ParameterValueMap[T] | null;
  /** Установить значение. */
  setValue(value: ParameterValueMap[T] | null): void;
  /** Установить значение из строки. */
  setValueString(s?: string | null): void;

  /** Метод, который возвращает неглубокую копию параметра. */
  clone(): Parameter<T>;
  /** Сериалзиация значения. */
  toString(): string | null;
}

/** Настройки редактора параметра. */
interface ParameterEditorOptions {
  /** Идентификатор типа редактора. */
  readonly type: ParameterEditorType;
  /** Имя параметра, отображаемое на интерфейсе. */
  readonly displayName: string;
  /** Добавлять ли в выпадающий список вариант со значением "не задано". */
  readonly showNullValue: boolean;
  /** Кастомный текст для значения "не задано". */
  readonly nullDisplayValue: string;
  /** Индекс для сортировки редакторов. */
  readonly order: number;
  /** Состояние, при котором запрещено редактирование параметра через редактор. */
  disabled?: boolean;
  /** Состояние, когда данные для выбора значения загружаются. */
  loading?: boolean;
}

/** Тип редактора для данного параметра. */
type ParameterEditorType = string;

/** Типы значений параметров. */
interface ParameterValueMap {
  /** Параметр, хранящий булево значение. */
  'bool': boolean;
  /** Параметр, хранящий целое число. */
  'integer': number;
  /** Параметр, хранящий массив целых чисел. */
  'integerArray': number[];
  /** Параметр, хранящий строку. */
  'string': string;
  /** Параметр, хранящий массив строк. */
  'stringArray': string[];
  /** Параметр, хранящий дробное число. */
  'double': number;
  /** Параметр, хранящий интервал из двух дробных чисел. */
  'doubleInterval': [number, number];
  /** Параметр, хранящий дату. */
  'date': Date;
  /** Параметр, хранящий интервал дат. */
  'dateInterval': {start: Date, end: Date};
  /** Параметр, хранящий хранит набор структур "поле-значение-тип". */
  'tableRow': Record<string, TypedCell>;
  /** Параметр, хранящий пару "тип-значение". */
  'tableCell': TypedCell;
  /** Параметр, хранящий массив пар значение-тип. */
  'tableCellsArray': TypedCell[];
}

/** Ячейка таблицы вместе с информацией о типе. */
interface TypedCell {
  /** Тип значения. */
  type: ColumnType;
  /** Значение. */
  value: any;
}

/** Группа параметров. */
interface ParameterGroup {
  /** ID который содержат параметры в поле `group`. */
  code: string;
  /** Название группы. */
  displayName: string;
}

/** Настройка, которая обновляет значение параметра при изменении других параметров. */
interface ParameterSetter {
  /** Параметр, значение которого нужно обновить. */
  readonly setParameter: ParameterID;
  /** Параметры, значения которых нужно будет передать в запрос `/executeReportProperty`. */
  readonly executeParameters: Set<ParameterID>;
  /** ID, который нужно будет передать в запрос выполнения. */
  readonly client: ClientID;
  /** Индекс, который нужно будет передать в запрос выполнения. */
  readonly index: number;
}
