import { stringifyLocalDate } from 'shared/lib';
import { stringToTableCell } from './table-row';


/** Словарь методов параметров по типам. */
export type ParameterMethodDict = {[key in ParameterType]: Record<string, ParameterMethod<key>>};

/** Функция преобразующая параметр в строку в соотв. с какой-либо логикой. */
export type ParameterMethod<T extends ParameterType = any> = (
  p: ParameterTypeMap[T], meta?: any) => string;


/**
 * Реализация серверных методов параметров.
 * Везде подразумевается, что значение параметра не `null`.
 * */
export const parameterMethodDict: ParameterMethodDict = {
  'bool': {
    'Value': (p) => {
      return String(p.value);
    },
    'ValueInt': (p) => {
      return p.value ? '1' : '0';
    },
  },
  'integer': {
    'Value': (p) => {
      return p.value.toString();
    },
  },
  'integerArray': {
    'CommaValue': (p) => {
      return p.value.join(',')
    },
    'DashValue': (p) => {
      return p.value.join('---')
    },
  },
  'string': {
    'Value': (p) => {
      return p.value;
    },
    'ValueXML': (p) => {
      return p.value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;');
    },
  },
  'stringArray': {
    'Value': (p) => {
      return p.value.join('|');
    },
    'CommaText': (p) => {
      return p.value.join(',');
    },
  },
  'double': {
    'Value': (p) => {
      return p.value.toString();
    },
    'ValueLocal': (p) => {
      return p.value.toString().replace('.', ',');
    },
  },
  'doubleInterval': {
    'Value': (p) => {
      return `${p.value[0]}->${p.value[1]}`;
    },
    'ValueLocal': (p) => {
      return `${p.value[0]}->${p.value[1]}`.replace('.', ',');
    },
    'ValueFrom': (p) => {
      return p.value[0].toString();
    },
    'ValueFromLocal': (p) => {
      return p.value[0].toString().replace('.', ',');
    },
    'ValueTo': (p) => {
      return p.value[1].toString();
    },
    'ValueToLocal': (p) => {
      return p.value[1].toString().replace('.', ',');
    },
  },
  'date': {
    'Value': (p) => {
      return stringifyLocalDate(p.value) + 'T00:00:00';
    },
    'ValueLocal': (p) => {
      return p.value.toLocaleDateString()
    },
    'Year': (p) => {
      return p.value.getFullYear().toString()
    },
    'Month': (p) => {
      return (p.value.getMonth() + 1).toString()
    },
    'MonthTwoDigits': (p) => {
      const month = p.value.getMonth() + 1;
      return month > 9 ? month.toString() : '0' + month;
    },
    'MonthName': (p) => {
      const name = p.value.toLocaleString(undefined, {month: 'long'});
      return name[0].toUpperCase() + name.substring(1);
    },
    'MonthNameLower': (p) => {
      return p.value.toLocaleString(undefined, {month: 'long'})
    },
    'Day': (p) => {
      return p.value.getDate().toString();
    },
    'DayTwoDigits': (p) => {
      const day = p.value.getDate();
      return day > 9 ? day.toString() : '0' + day;
    },
    'ValueGMW': (p) => {
      return stringifyLocalDate(p.value);
    },
    'ValueGMW3D': (p) => {
      return dateToNumbers(p.value);
    },
  },
  'dateInterval': {
    'Value': (p) => {
      const startStr = stringifyLocalDate(p.value.start) + 'T00:00:00';
      const endStr = stringifyLocalDate(p.value.end) + 'T00:00:00';
      return startStr + ' - ' + endStr;
    },
    'ValueLocal': (p) => {
      return p.value.start.toLocaleDateString() + ' - ' + p.value.end.toLocaleDateString();
    },
    'ValueFrom': (p) => {
      return stringifyLocalDate(p.value.start) + 'T00:00:00';
    },
    'ValueFromLocal': (p) => {
      return p.value.start.toLocaleDateString();
    },
    'ValueTo': (p) => {
      return stringifyLocalDate(p.value.end) + 'T00:00:00';
    },
    'ValueToLocal': (p) => {
      return p.value.end.toLocaleDateString();
    },
    'ValueFromGMW': (p) => {
      return stringifyLocalDate(p.value.start);
    },
    'ValueToGMW': (p) => {
      return stringifyLocalDate(p.value.end);
    },
    'ValueFromNumber': (p) => {
      return dateToNumbers(p.value.start);
    },
    'ValueToNumber': (p) => {
      return dateToNumbers(p.value.end);
    },
  },
  'tableRow': {
    'Value': (p) => {
      return stringToTableCell(p.value, 'LOOKUPVALUE');
    },
    'Code': (p) => {
      return stringToTableCell(p.value, 'LOOKUPCODE');
    },
    'StringValue': (p) => {
      return p.value;
    },
    'CellValue': (p, column) => {
      return stringToTableCell(p.value, column);
    },
    'CellValueLocal': (p, column) => {
      return stringToTableCell(p.value, column);
    },
  },
  'tableCell': {
    'Value': (p) => {
      return p.value.substring(0, p.value.indexOf('#'));
    },
    'ValueLocal': (p) => {
      return p.value.substring(0, p.value.indexOf('#'));
    },
  },
  'tableCellsArray': {
    // ???
  },
};

/**
 * Приводит дату к формату `DDMMYYYY` без учёта временной зоны.
 * @example
 * dateToNumbers(new Date(2023, 6, 14)) => "14072023"
 * */
function dateToNumbers(date: Date) {
  const month = date.getMonth() + 1;
  const monthString = month > 9 ? month : '0' + month;
  const day = date.getDate();
  const dayString = day > 9 ? day.toString() : '0' + day;
  return dayString + monthString + date.getFullYear();
}
