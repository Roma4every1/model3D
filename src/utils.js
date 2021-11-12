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