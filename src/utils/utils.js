/* --- Вспомогательные функции --- */

/** Преобразование информации о системе в удобный формат.
 * Используется в компоненте `SystemList`.
 * @return WMWSystem
 * */
export const mapSystem = (rawSystem) => {
  const id = rawSystem['Name'];
  const attributes = rawSystem['Attributes'];
  if (attributes instanceof Array) {
    const system = Object.fromEntries(attributes.map(attr => [attr.Key, attr.Value]));
    system.id = id;
    return system;
  } else {
    return {...rawSystem['Attributes'], id};
  }
}

/** Сравнивает два массива на равенство.
 *
 * **Не делает глубокое сравнение.**
 * @param a {any[]}
 * @param b {any[]}
 * @example
 * const obj = {}
 * compareArrays([1, 2], [1, 2]) => true
 * compareArrays([obj], [obj])   => true
 * compareArrays([obj], [{}])    => false
 * */
export const compareArrays = (a, b) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

/** Сравнивает два объекта на равенство.
 *
 * **Не делает глубокое сравнение.**
 * @param a {object}
 * @param b {object}
 * @example
 * compareObjects({x: 1}, {x: 1})   => true
 * compareObjects({x: []}, {x: []}) => false
 * */
export const compareObjects = (a, b) => {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;

  for (const key of aKeys) {
    if (a[key] !== b[key]) return false;
  }
  return true;
};

export const equalParams = (p1, p2) => {
  if (!p1 || !p2 || p1.length !== p2.length) return false;

  for (let i = 0; i < p1.length; i++) {
    if (p1[i] !== p2[i]) return false;
  }
  return true;
}

export const getParentFormId = (formId) => {
  const index1 = formId.lastIndexOf(':');
  const index2 = formId.lastIndexOf(',');

  let index = index1;
  if (index === -1 || index2 > index1) index = index2;

  return (index === -1) ? '' : formId.substring(0, index);
}

/**
 * @param dateStrWMW {string}
 * @return {Date}
 * */
export const toDate = (dateStrWMW) => {
  if (!dateStrWMW.startsWith('/')) return new Date(dateStrWMW);
  const startIndex = dateStrWMW.indexOf('(');
  const finishIndex = dateStrWMW.lastIndexOf('+');
  const dateValue = dateStrWMW.slice(startIndex + 1, finishIndex);

  const date = new Date();
  date.setTime(dateValue);
  return date;
}

const addToTwo = (value) => {
  while (value.length < 2) {
    value = '0' + value;
  }
  return value;
}

export const dateToString = (value) => {
  if (!(value instanceof Date)) return value;

  const month = addToTwo('' + (value.getMonth() + 1));
  const day = addToTwo('' + value.getDate());
  const year = '' + value.getFullYear();
  const hours = addToTwo('' + value.getHours());
  const minutes = addToTwo('' + value.getMinutes());
  const seconds = addToTwo('' + value.getSeconds());

  return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
}

export const tableRowToString = (valuesToSelect, row) => {
  if (!row) return null;

  const addParam = (column, rowValue, propName) => {
    let valueString;
    if (column['NetType'] === "System.DateTime" && rowValue != null) {
      valueString = propName + '#' + dateToString(toDate(rowValue)) + '#' + column['NetType'];
    } else if (rowValue != null) {
      valueString = propName + '#' + rowValue + '#' + column['NetType'];
    } else {
      valueString = propName + '##System.DBNull';
    }
    return valueString;
  }

  const addParamRow = (properties, column, row, index) => {
    let result = '';
    if (index !== 0) result = '|';

    result += addParam(column, row.Cells[index], column.Name.toUpperCase());

    const propName = properties.find(p => p.fromColumn?.toUpperCase() === column.Name.toUpperCase());
    if (propName) {
      result += '|' + addParam(column, row.Cells[index], propName.name.toUpperCase());
    }
    return result;
  }

  let valueString = '';
  valuesToSelect.data.Columns.forEach((column, index) => {
    valueString += addParamRow(valuesToSelect.properties, column, row, index)
  });

  return {
    id: row.Cells[valuesToSelect.idIndex],
    name: row.Cells[valuesToSelect.nameIndex] ?? '',
    value: valueString,
  };
}

export const tableCellToString = (valuesToSelect, row) => {
  if (!row) return null;

  const addParam = (column, rowValue) => {
    let valueString;
    if (column['NetType'] === "System.DateTime" && rowValue != null) {
      valueString = dateToString(toDate(rowValue)) + '#' + column['NetType'];
    } else if (rowValue != null) {
      valueString = rowValue + '#' + column['NetType'];
    } else {
      valueString = '#System.DBNull';
    }
    return valueString;
  }

  const temp = {
    id: row.Cells[valuesToSelect.idIndex],
    name: row.Cells[valuesToSelect.nameIndex],
  };

  if (valuesToSelect.parentIndex >= 0) {
    temp.parent = row.Cells[valuesToSelect.parentIndex];
  }
  temp.value = addParam(valuesToSelect.data.Columns[valuesToSelect.idIndex], temp.id);

  return temp;
}

/**
 * @param rowString {string}
 * @param columnName {string}
 * @return string
 * */
export const stringToTableCell = (rowString, columnName) => {
  rowString = rowString.toString();
  const startIndex = rowString.indexOf(columnName + '#');
  const endIndex = rowString.indexOf('#', startIndex + columnName.length + 1);

  let dataValue;
  if (startIndex === -1) {
    dataValue = rowString;
  } else {
    dataValue = rowString.slice(startIndex + columnName.length + 1, endIndex === -1 ? undefined : endIndex);
  }
  return dataValue;
}
