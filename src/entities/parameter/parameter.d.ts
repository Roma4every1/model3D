/** Словарь параметров. */
type ParamDict = Record<ClientID, Parameter[]>;

/** Идентификатор параметра формы. */
type ParameterID = string;

/** Тип параметра формы. */
type ParameterType = 'bool' | 'integer' | 'integerArray' | 'string' | 'stringArray' | 'double' |
  'doubleInterval' | 'date' | 'dateInterval' | 'tableCell' | 'tableCellsArray' | 'tableRow';

/** Необходимые свойства параметра для получения данных канала.
 * + `id`: {@link ParameterID}
 * + `type`: {@link ParameterType}
 * + `value: string`
 * */
interface SerializedParameter {
  /** ID параметра. */
  id: ParameterID;
  /** Тип параметра. */
  type: ParameterType | 'sortOrder';
  /** Сериализованное значение параметра. */
  value: string | null;
}

/** Слушатель события изменения значения параметра и всех его зависимостей. */
type ParameterOnDeepChange = (p: Parameter, oldValue?: any) => Promise<void>;

interface Parameter<T extends ParameterType = ParameterType> {
  /** Идентификатор параметра. */
  readonly id: ParameterID;
  /** Тип параметра. */
  readonly type: T;

  /** Настройки редактора. */
  editor?: ParameterEditorOptions;
  /** Название канала, из которого берутся данные для выбора значения. */
  channelName?: ChannelName;

  /** Получить значение параметра. */
  getValue(): ParameterValueMap[T] | null;
  /** Установить значение. */
  setValue(value: ParameterValueMap[T] | null, deep?: boolean): void | Promise<void>;
  /** Установить значение из строки. */
  setValueString(s?: string | null): void;
  /** Слушатель события изменения значения и всех его зависимостей. */
  onDeepChange?: ParameterOnDeepChange;

  /** Метод, который возвращает неглубокую копию параметра. */
  clone(): Parameter<T>;
  /** Сериалзиация значения. */
  toString(): string | null;

  /** Параметры, смена значений которых приводит к сбросу значения. */
  dependsOn?: ParameterID[];
  /** Сеттеры параметров, которые нужно обновить при обновлении данного. */
  relatedSetters?: (ParameterSetter & {clientID: ClientID})[];
  /** Каналы, которые зависят от данного параметра. */
  relatedChannels?: ChannelName[];
  /** Каналы процедур, которые зависят от данного параметра. */
  relatedReportChannels?: RelatedReportChannels[];
  /** Процедуры, доступность которых зависят от данного параметра. */
  relatedReports?: ReportID[];
}

/** Настройки редактора параметра. */
interface ParameterEditorOptions {
  /** Идентификатор типа редактора. */
  readonly type: ParameterEditorType;
  /** Имя параметра, отображаемое на интерфейсе. */
  readonly displayName: string;
  /** Позволяет ли редактор сбрасывать значение. */
  readonly canBeNull: boolean;
  /** Добавлять ли в выпадающий список вариант со значением "не задано". */
  readonly showNullValue: boolean;
  /** Кастомный текст для значения "не задано". */
  readonly nullDisplayValue: string;
  /** Индекс для сортировки редакторов. */
  readonly order: number;
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
