const useWMWServer = true;
const ReactServerPrePath = 'session/';
const WMWServerPrePath = 'http://localhost:81/WellManager.ServerSide.Site/WebRequests.svc/';

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