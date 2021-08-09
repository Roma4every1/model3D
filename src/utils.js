const useWMWServer = true;
const ReactServerPrePath = 'session/';
const WMWServerPrePath = 'http://localhost:81/WellManager.ServerSide.Site/WebRequests.svc/';

export async function webFetch(request) {
    if (useWMWServer) {
        return await fetch(WMWServerPrePath + request,
            {
                credentials: 'include'
            });
    }
    else {
        return await fetch(ReactServerPrePath + request)
    }
}