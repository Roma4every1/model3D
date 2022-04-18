const useWMWServer = process.env.USEWMWSERVER ?? true;
const ReactServerPrePath = 'session/';
const WMWServerPrePath = process.env.WMWSERVERPREPATH ?? 'http://kmn-wmw:8080/ID2x/WebRequests.svc/';

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
    var index = formId.indexOf(',');
    if (index === -1) {
        return formId
    }
    else {
        return formId.substring(0, index);
    }
}

export const getParentFormId = (formId) => {
    var index1 = formId.lastIndexOf(':');
    var index2 = formId.lastIndexOf(',');
    var index = index1;
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
        var valuestring = '';
        if (column.NetType === "System.DateTime" && rowValue != null) {
            valuestring = propName + '#' + dateToString(toDate(rowValue)) + '#' + column.NetType;
        }
        else if (rowValue != null) {
            valuestring = propName + '#' + rowValue + '#' + column.NetType;
        }
        else {
            valuestring = propName + '##System.DBNull';
        }
        return valuestring;
    }
    let temp = {};
    temp.id = row.Cells[valuesToSelect.idIndex];
    temp.name = row.Cells[valuesToSelect.nameIndex];
    var valuestring = '';
    valuesToSelect.data.Columns.forEach((column, index) => {
        valuestring += addParamRow(valuesToSelect.properties, column, row, index)
    });
    temp.value = valuestring;
    return temp
}

export const tableCellToString = (valuesToSelect, row) => {

    if (!row) {
        return null;
    }

    const addParam = (column, rowValue) => {
        var valuestring = '';
        if (column.NetType === "System.DateTime" && rowValue != null) {
            valuestring = dateToString(toDate(rowValue)) + '#' + column.NetType;
        }
        else if (rowValue != null) {
            valuestring = rowValue + '#' + column.NetType;
        }
        else {
            valuestring = '#System.DBNull';
        }
        return valuestring;
    }
    let temp = {};
    temp.id = row.Cells[valuesToSelect.idIndex];
    temp.name = row.Cells[valuesToSelect.nameIndex];
    if (valuesToSelect.parentIndex >= 0) {
        temp.parent = row.Cells[valuesToSelect.parentIndex];
    }
    var valuestring = addParam(valuesToSelect.data.Columns[valuesToSelect.idIndex], temp.id);
    temp.value = valuestring;
    return temp
}

export const stringToTableCell = (rowstring, columnName) => {

    let columnNameLength = columnName.length + 1;
    let stringvalue = String(rowstring);
    const startIndex = stringvalue.indexOf(columnName + '#');
    var finishIndex = stringvalue.indexOf('#', startIndex + columnNameLength);
    let dataValue;
    if (startIndex === -1) {
        dataValue = stringvalue;
    }
    else if (finishIndex === -1) {
        dataValue = stringvalue.slice(startIndex + columnNameLength);
    }
    else {
        dataValue = stringvalue.slice(startIndex + columnNameLength, finishIndex);
    }
    return dataValue;
}

export const getLinkedPropertyValue = (linkedPropertyString, formId, state) => {

    let startFoundIndex = 0;
    let returnString = '';
    let startIndex = 0;
    let finish = '';
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
            var neededParamValues = state.sessionManager.paramsManager.getParameterValues([parameterName], formId, false);
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