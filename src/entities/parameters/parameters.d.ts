/** Словарь параметров. */
type ParamDict = Record<string, Parameter[]>;

/** Идентификатор параметра формы. */
type ParameterID = string;

/** Тип параметра формы. */
type ParameterType = 'bool' | 'integer' | 'integerArray' | 'string' | 'stringArray' | 'double' |
  'doubleInterval' | 'date' | 'dateInterval' | 'tableCell' | 'tableCellsArray' | 'tableRow';

/** Группа параметров. */
interface ParameterGroup {
  /** ID который содержат параметры в поле `group`. */
  code: string;
  /** Название группы. */
  displayName: DisplayName;
}

/** Параметр формы. */
type Parameter = ParamBool | ParamInteger | ParamIntegerArray | ParamString |
  ParamStringArray | ParamDouble | ParamDoubleInterval | ParamDate | ParamDateInterval |
  ParamTableRow | ParamTableCell | ParamCellsArray;

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

interface ParameterTypeMap {
  'bool': ParamBool;
  'integer': ParamInteger;
  'integerArray': ParamIntegerArray;
  'string': ParamString;
  'stringArray': ParamStringArray;
  'double': ParamDouble;
  'doubleInterval': ParamDoubleInterval;
  'date': ParamDate;
  'dateInterval': ParamDateInterval;
  'tableRow': ParamTableRow;
  'tableCell': ParamTableCell;
  'tableCellsArray': ParamCellsArray;
}

/** ### Параметр, хранящий булево значение.
 * Редакторы: `boolTextEditor`.
 * @example
 * true
 * "true" // serialized
 * */
type ParamBool = FormParamProto<'bool', ParamValueBool>;
type ParamValueBool = boolean;

/** ### Параметр, хранящий целое число.
 * Редакторы: `integerTextEditor`, `integerComboEditor`.
 * @example
 * 42
 * "42" // serialized
 * */
type ParamInteger = FormParamProto<'integer', ParamValueInteger>;
type ParamValueInteger = number;

/** ### Параметр, хранящий массив целых чисел.
 * Редакторы: `integerArrayTreeEditor`.
 * @example
 * [2, 4, 8]
 * "2,4,8" // serialized
 * */
type ParamIntegerArray = FormParamProto<'integerArray', ParamValueIntegerArray>;
type ParamValueIntegerArray = number[];

/** ### Параметр, хранящий строку.
 * Редакторы: `stringComboEditor`, `stringTextEditor`, `fileTextEditor`, `fileComboEditor`.
 * @example
 * "some string"
 * "some string" // serialized
 * */
type ParamString = FormParamProto<'string', ParamValueString>;
type ParamValueString = string;

/** ### Параметр, хранящий массив строк.
 * Редакторы: `filesTextEditor`.
 * @example
 * ["get", "set"]
 * "get|set" // serialized
 * */
type ParamStringArray = FormParamProto<'stringArray', ParamValueStringArray>;
type ParamValueStringArray = string[];

/** ### Параметр, хранящий дробное число.
 * Редакторы: `doubleTextEditor`.
 * @example
 * 42.42
 * "42.42" // serialized
 * */
type ParamDouble = FormParamProto<'double', ParamValueDouble>;
type ParamValueDouble = number;

/** ### Параметр, хранящий интервал из двух дробных чисел.
 * Редакторы: `doubleIntervalTextEditor`.
 * @example
 * [0, 1.5]
 * "0->1.5" // serialized
 * */
type ParamDoubleInterval = FormParamProto<'doubleInterval', ParamValueDoubleInterval>;
type ParamValueDoubleInterval = [number, number];

/** ### Параметр, хранящий дату.
 * Редакторы: `dateTextEditor`, `dateComboEditor`.
 * @example
 * Date.UTC(2020, 11, 20, 3, 23, 16)
 * "11/20/2020 03:23:16" // serialized
 * */
type ParamDate = FormParamProto<'date', ParamValueDate>;
type ParamValueDate = Date;

/** ### Параметр, хранящий интервал дат.
 * Редакторы: `dateIntervalTextEditor`.
 * @example
 * [Date.UTC(2020, 11, 20, 3, 23, 16), Date.UTC(2022, 11, 20, 3, 23, 16)]
 * "11/20/2020 03:23:16 - 11/20/2022 03:23:16" // serialized
 * */
type ParamDateInterval = FormParamProto<'dateInterval', ParamValueDateInterval>;
type ParamValueDateInterval = {start: Date, end: Date};

/** ### Параметр, хранящий пару "тип-значение".
 * Редакторы: `tableCellComboEditor`.
 * @example
 * "1#System.Int16"
 * "1#System.Int16" // serialized
 * */
type ParamTableCell = FormParamProto<'tableCell', ParamValueTableCell>;
type ParamValueTableCell = string;

/** ### Параметр, хранящий массив пар значение-тип.
 * Редакторы: `tableCellsArrayListEditor`.
 * @example
 * ["1#System.Int16", "2#System.Int16"]
 * "1#System.Int16|2#System.Int16" // serialized
 * */
type ParamCellsArray = FormParamProto<'tableCellsArray', ParamValueCellsArray>;
type ParamValueCellsArray = string[];

/** ### Параметр, хранящий хранит набор структур "поле-значение-тип".
 * Редакторы: `tableRowComboEditor`.
 * @example
 * ["LOOKUPCODE#1#System.Int16", "LOOKUPVALUE##System.DBNull"]
 * "LOOKUPCODE#1#System.Int16|LOOKUPVALUE##System.DBNull" // serialized
 * */
type ParamTableRow = FormParamProto<'tableRow', ParamValueTableRow>;
type ParamValueTableRow = string;

interface FormParamProto<Type extends ParameterType, Value> {
  readonly id: ParameterID;
  readonly type: Type;
  value: Value;
  canBeNull?: boolean;
  readonly displayName?: string;

  editor?: any; // FunctionComponent<EditorProps>>
  editorType?: ParameterEditorType;
  readonly editorDisplayOrder?: number;

  /** Параметры, смена значений которых приводит к сбросу значения. */
  dependsOn?: ParameterID[];
  /** Каналы, которые зависят от данного параметра. */
  relatedChannels?: ChannelName[];
  /** Каналы процедур, которые зависят от данного параметра. */
  relatedReportChannels?: RelatedReportChannels[];
  /** Процедуры, доступность которых зависят от данного параметра. */
  relatedReports?: ReportID[];

  readonly externalChannelName: ChannelName;
  readonly showNullValue: boolean;
  nullDisplayValue: string;
}

/** Тип редактора для данного параметра. */
type ParameterEditorType = string;

/** Данные для обновления параметра. */
type UpdateParamData = {clientID: FormID, id: ParameterID, value: any};
