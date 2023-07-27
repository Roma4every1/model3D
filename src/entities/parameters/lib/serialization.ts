import { stringifyLocalDate } from 'shared/lib';


/** Убирает лишние свойста и сериализует значение параметра перед отправкой запроса на сервер. */
export function serializeParameter(parameter: Parameter): SerializedParameter {
  const type = parameter.type;
  const value = serializeParamValue(type, parameter.value);
  return {id: parameter.id, type, value};
}

/** Сериализует параметр в строку для передачи на сервер. */
function serializeParamValue(type: ParameterType, value: any): string | null {
  if (value === null) return value;
  switch (type) {
    case 'tableRow': { return value; }
    case 'tableCell': { return value; }
    case 'tableCellsArray': { return value.join('|'); }
    case 'date': { return stringifyLocalDate(value); }
    case 'dateInterval': { return serializeDateInterval(value); }
    case 'double': { return value.toString(); }
    case 'doubleInterval': { return value[0] + '->' + value[1]; }
    case 'string': { return value; }
    case 'stringArray': { return value.join('|'); }
    case 'integer': { return value.toString(); }
    case 'integerArray': { return value.join(','); }
    default: { return String(value); } // for boolean or unknown
  }
}

/** Сериализует интервал дат в серверный формат. */
function serializeDateInterval({start, end}: ParamValueDateInterval): string {
  if (!start || !end || start > end) return null;
  return stringifyLocalDate(start) + ' - ' + stringifyLocalDate(end);
}
