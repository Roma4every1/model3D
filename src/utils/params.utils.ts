/* --- Deserialization --- */

/** Десереализует значение параметра из сервернего формата во внутренний. */
export function parseParamValue(parameter: FormParameter): void {
  parameter.value = getParsedParamValue(parameter.type, parameter.value as string);
}

/** Возвращает десереализованное значение параметра исходя из его типа. */
function getParsedParamValue(type: ParameterType, rawValue: string | null) {
  if (rawValue === null) return rawValue;
  switch (type) {
    case 'tableRow': { return rawValue; }
    case 'tableCell': { return rawValue; }
    case 'tableCellsArray': { return rawValue; }
    case 'date': { return new Date(rawValue); }
    case 'dateInterval': { return parseDateInterval(rawValue); }
    case 'double': { return parseFloat(rawValue); }
    case 'doubleInterval': { return parseDoubleInterval(rawValue) }
    case 'string': { return rawValue; }
    case 'stringArray': { return rawValue.split('|'); }
    case 'integer': { return parseInt(rawValue); }
    case 'integerArray': { return parseIntegerArray(rawValue); }
    case 'bool': { return parseBool(rawValue); }
    default: { throw new Error('Unknown parameter format: ' + type); }
  }
}

function parseBool(valueString: string): ParamValueBool {
  return valueString.toLowerCase() === 'true' || valueString === '1';
}

function parseIntegerArray(valueString: string): ParamValueIntegerArray {
  const values = valueString.split(',');
  return values.map(n => parseInt(n));
}

function parseDoubleInterval(valueString: string): ParamValueDoubleInterval {
  const [valueFrom, valueTo] = valueString.split('->');
  return [parseFloat(valueFrom), parseFloat(valueTo)];
}

function parseDateInterval(valueString: string): ParamValueDateInterval {
  const [start, end] = valueString.split(' - ');
  return {start: new Date(start), end: new Date(end)};
}

/* --- Serialization --- */

/** Убирает лишние свойста и сериализует значение параметра перед отправкой запроса на сервер. */
export function paramToChannelParamData(parameter: FormParameter): SerializedFormParameter {
  const type = parameter.type;
  const value = serializeParamValue(type, parameter.value);
  return {id: parameter.id, type, value};
}

/** Сериализует параметр в строку для передачи на сервер. */
export function serializeParamValue(type: ParameterType, value: any): string | null {
  if (value === null) return value;
  switch (type) {
    case 'tableRow': { return value; }
    case 'tableCell': { return value; }
    case 'tableCellsArray': { return value; }
    case 'date': { return serializeDate(value); }
    case 'dateInterval': { return serializeDateInterval(value.start, value.end); }
    case 'double': { return value.toString(); }
    case 'doubleInterval': { return value[0] + '->' + value[1]; }
    case 'string': { return value; }
    case 'stringArray': { return value.join('|'); }
    case 'integer': { return value.toString(); }
    case 'integerArray': { return value.join(','); }
    default: { return String(value); } // for boolean or unknown
  }
}

/** Сериализует дату в серверный формат. */
function serializeDate(date: Date): string {
  // TODO: протестить
  return date.toJSON();
  // const month = date.getMonth() + 1;
  // const monthString = month > 9 ? month.toString() : '0' + month;
  //
  // const day = date.getDate();
  // const dayString = day > 9 ? day.toString() : '0' + day;
  //
  // const dateString = `${monthString}/${dayString}/${date.getFullYear()}`;
  // const timeString = date.toLocaleTimeString('ru');
  // return dateString + ' ' + timeString;
}

/** Сериализует интервал дат в серверный формат. */
function serializeDateInterval(start: Date, end: Date): string {
  return serializeDate(start) + ' - ' + serializeDate(end);
}
