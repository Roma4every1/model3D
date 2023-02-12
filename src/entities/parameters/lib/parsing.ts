/** Возвращает десереализованное значение параметра исходя из его типа. */
export function getParsedParamValue(type: ParameterType, rawValue: unknown) {
  if (typeof rawValue !== 'string') return null;
  switch (type) {
    case 'tableRow': { return rawValue; }
    case 'tableCell': { return rawValue; }
    case 'tableCellsArray': { return rawValue.split('|'); }
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
