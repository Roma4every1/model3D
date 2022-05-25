/* --- Определние ссылки для API --- */

/**
 * URL для взаимодействия с сервером, если не определена переменая окружения для API
 * (`process.env.WMW_SERVER_URL`). Обычно заканчивается на `".../WebRequests.svc/"`
 * @example
 * "http://gs-wp51:81/WellManager.ServerSide.Site/WebRequests.svc/" // С демо системой
 * "http://kmn-wmw:8080/ID2x/WebRequests.svc/" // Калининградские системы
 * "http://wmw-usi/wmw/WebRequests.svc/" // Коми
 * */
const defaultURL = 'http://kmn-wmw:8080/ID2x/WebRequests.svc';

let useServer = process.env.USE_WMW_SERVER ?? true;
let serverURL = process.env.WMW_SERVER_URL ?? defaultURL;

const getServerURL = () => {
  if (!serverURL.endsWith('/')) serverURL += '/';
  return useServer ? serverURL : 'session/';
}
/** Ссылка, которая будет использоваться при взаимодействии с сервером. */
const URL = getServerURL();

/* --- Вспомогательные функции --- */

export async function webFetch(request, params) {
  return await fetch(URL + request, {credentials: 'include', ...params});
}

export const capitalizeFirstLetter = (string) => {
  if (typeof string !== 'string') return null;
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export const equalParams = (p1, p2) => {
  if (!p1 || !p2 || p1.length !== p2.length) return false;

  for (let i = 0; i < p1.length; i++) {
    if (p1[i] !== p2[i]) return false;
  }
  return true;
}

export const getRootFormId = (formId) => {
  const index = formId.indexOf(',');
  return (index === -1) ? formId : formId.substring(0, index);
}

export const getParentFormId = (formId) => {
  const index1 = formId.lastIndexOf(':');
  const index2 = formId.lastIndexOf(',');

  let index = index1;
  if (index === -1 || index2 > index1) index = index2;

  return (index === -1) ? '' : formId.substring(0, index);
}

export const toDate = (wmwDateString) => {
  const startIndex = wmwDateString.indexOf('(');
  const finishIndex = wmwDateString.lastIndexOf('+');
  const dateValue = wmwDateString.slice(startIndex + 1, finishIndex);

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
    name: row.Cells[valuesToSelect.nameIndex],
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

export const stringToTableCell = (rowString, columnName) => {
  const columnNameLength = columnName.length + 1;
  const stringValue = String(rowString);
  const startIndex = stringValue.indexOf(columnName + '#');
  const finishIndex = stringValue.indexOf('#', startIndex + columnNameLength);

  let dataValue;
  if (startIndex === -1) {
    dataValue = stringValue;
  } else if (finishIndex === -1) {
    dataValue = stringValue.slice(startIndex + columnNameLength);
  } else {
    dataValue = stringValue.slice(startIndex + columnNameLength, finishIndex);
  }
  return dataValue;
}

export const getLinkedPropertyValue = (linkedPropertyString, formId, state) => {
  let startFoundIndex = 0, startIndex = 0, finish = '', returnString = '';
  let resultBroken = false;

  while (startIndex > -1) {
    startIndex = linkedPropertyString.indexOf('$(', startFoundIndex);
    if (startIndex > -1) {
      let finishIndex = linkedPropertyString.indexOf(')', startIndex);
      let start = linkedPropertyString.slice(startFoundIndex + 1, startIndex);

      startFoundIndex = finishIndex;
      finish = linkedPropertyString.slice(finishIndex + 1);

      let pathToChange = linkedPropertyString.slice(startIndex + 2, finishIndex);
      let pointIndex = pathToChange.indexOf('.');
      let bracketIndex = pathToChange.indexOf('[');
      let semicolonIndex = pathToChange.indexOf(':');
      let parameterName = pathToChange.slice(0, pointIndex);
      let type = pathToChange.slice(pointIndex + 1, bracketIndex);
      let propertyName = pathToChange.slice(bracketIndex + 1, semicolonIndex > -1 ? semicolonIndex - 1 : -1);
      let defaultValue = semicolonIndex > -1 ? pathToChange.slice(semicolonIndex + 1) : null;

      if (bracketIndex < 0) {
        type = pathToChange.slice(pointIndex + 1);
        propertyName = null;
      }

      const neededParamValues = state.sessionManager.paramsManager.getParameterValues([parameterName], formId, false);
      let propertyValue = neededParamValues[0]?.value;

      if (type === 'CellValue' && propertyValue) {
        propertyValue = stringToTableCell(neededParamValues[0].value, propertyName);
      }

      if (propertyValue || defaultValue) {
        returnString += start + (propertyValue ?? defaultValue);
      } else {
        returnString = '';
        resultBroken = true;
        break;
      }
    }
  }
  if (!resultBroken) returnString += finish;
  return returnString;
}
