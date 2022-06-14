const useWMWServer = process.env.USEWMWSERVER ?? true;
const ReactServerPrePath = 'session/';
const WMWServerPrePath = 'http://localhost:81/ID11_IRA/webRequests.svc/' //process.env.WMWSERVERPREPATH ?? '';

// с демо системой: http://gs-wp51:81/WellManager.ServerSide.Site/WebRequests.svc/
// калинингдаркие:  http://kmn-wmw:8080/ID2x/WebRequests.svc

export function getServerUrl() {
    if (useWMWServer) {
        return WMWServerPrePath;
    }
    else {
        return ReactServerPrePath;
    }
}

export async function webFetch(request, params) {
    let url = getServerUrl();
    return await fetch(url + request,
        {
            credentials: 'include',
            ...params
        });
}

export const capitalizeFirstLetter = (string) => {
    if (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    else
        return null;
}

export const getRootFormId = (formId) => {
    const index = formId.indexOf(',');
    if (index === -1) {
        return formId
    }
    else {
        return formId.substring(0, index);
    }
}

export const getParentFormId = (formId) => {
    const index1 = formId.lastIndexOf(':');
    const index2 = formId.lastIndexOf(',');
    let index = index1;
    if (index === -1 || index2 > index1) {
        index = index2;
    }
    if (index === -1) {
        return ''
    }
    else {
        return formId.substring(0, index);
    }
}

export const toDate = (wmwDateString) => {
    const startIndex = wmwDateString.indexOf('(');
    const finishIndex = wmwDateString.lastIndexOf('+');
    const dateValue = wmwDateString.slice(startIndex + 1, finishIndex);
    var d = new Date();
    d.setTime(dateValue);
    return d;
}

const addToTwo = (value) =>
{
    while (value.length < 2) {
        value = '0' + value;
    }
    return value;
}

export const dateToString = (value) => {
    if (value instanceof Date) {
        let month = addToTwo('' + (value.getMonth() + 1));
        let day = addToTwo('' + value.getDate());
        let year = '' + value.getFullYear();
        let hours = addToTwo('' + value.getHours());
        let minutes = addToTwo('' + value.getMinutes());
        let seconds = addToTwo('' + value.getSeconds());

        return (month + '/' + day + '/' + year + ' ' +
            hours + ':' + minutes + ':' + seconds);
    }
    else {
        return value;
    }
}

export const tableRowToString = (valuesToSelect, row) => {

    if (!row) {
        return null;
    }

    const addParamRow = (properties, column, row, index) => {
        var result = '';
        if (index !== 0) {
            result = '|'
        }
        result += addParam(column, row.Cells[index], column.Name.toUpperCase());
        var propName = properties.find(p => p.fromColumn?.toUpperCase() === column.Name.toUpperCase());
        if (propName) {
            result += '|' + addParam(column, row.Cells[index], propName.name.toUpperCase());
        }
        return result;
    }

    const addParam = (column, rowValue, propName) => {
        let valueString;
        if (column.NetType === "System.DateTime" && rowValue != null) {
            valueString = propName + '#' + dateToString(toDate(rowValue)) + '#' + column.NetType;
        }
        else if (rowValue != null) {
            valueString = propName + '#' + rowValue + '#' + column.NetType;
        }
        else {
            valueString = propName + '##System.DBNull';
        }
        return valueString;
    }
    let temp = {};
    temp.id = row.Cells[valuesToSelect.idIndex];
    temp.name = row.Cells[valuesToSelect.nameIndex];
    let valueString = '';
    valuesToSelect.data.Columns.forEach((column, index) => {
        valueString += addParamRow(valuesToSelect.properties, column, row, index)
    });
    temp.value = valueString;
    return temp
}

export const tableCellToString = (valuesToSelect, row) => {

    if (!row) {
        return null;
    }

    const addParam = (column, rowValue) => {
        let valueString;
        if (column['NetType'] === "System.DateTime" && rowValue != null) {
            valueString = dateToString(toDate(rowValue)) + '#' + column['NetType'];
        }
        else if (rowValue != null) {
            valueString = rowValue + '#' + column['NetType'];
        }
        else {
            valueString = '#System.DBNull';
        }
        return valueString;
    }
    let temp = {};
    temp.id = row.Cells[valuesToSelect.idIndex];
    temp.name = row.Cells[valuesToSelect.nameIndex];
    if (valuesToSelect.parentIndex >= 0) {
        temp.parent = row.Cells[valuesToSelect.parentIndex];
    }
    temp.value = addParam(valuesToSelect.data.Columns[valuesToSelect.idIndex], temp.id);
    return temp
}

export const stringToTableCell = (rowString, columnName) => {
    const columnNameLength = columnName.length + 1;
    const stringValue = String(rowString);
    const startIndex = stringValue.indexOf(columnName + '#');
    const finishIndex = stringValue.indexOf('#', startIndex + columnNameLength);

    let dataValue;
    if (startIndex === -1) {
        dataValue = stringValue;
    }
    else if (finishIndex === -1) {
        dataValue = stringValue.slice(startIndex + columnNameLength);
    }
    else {
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
            }
            else {
                returnString = '';
                resultBroken = true;
                break;
            }
        }
    }
    if (!resultBroken) {
        returnString += finish;
    }
    return returnString;
}