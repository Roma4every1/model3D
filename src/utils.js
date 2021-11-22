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