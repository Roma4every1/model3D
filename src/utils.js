const useWMWServer = process.env.USEWMWSERVER ?? true;
const ReactServerPrePath = 'session/';
const WMWServerPrePath = process.env.WMWSERVERPREPATH ?? 'http://localhost:81/WellManager.ServerSide.Site/WebRequests.svc/';

export async function webFetch(request, params) {
    if (useWMWServer) {
        return await fetch(WMWServerPrePath + request,
            {
                credentials: 'include',
                ...params
            });
    }
    else {
        return await fetch(ReactServerPrePath + request)
    }
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