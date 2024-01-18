interface IBaseAPI {
  setBase(base: string): void;
  setSessionID(sessionID: SessionID): void;
  request<Expected>(req: WRequest): Promise<Res<Expected>>;
}


export class BaseAPI implements IBaseAPI {
  private base: string = '/';
  private sessionID: SessionID = '';

  public static mapperDict = {
    'text': (res: Response) => res.text(),
    'json': (res: Response) => res.json(),
    'blob': (res: Response) => res.blob(),
    'buffer': (res: Response) => res.arrayBuffer(),
  };

  public setBase(base: string): void {
    this.base = base;
  }
  public setSessionID(sessionID: SessionID): void {
    this.sessionID = sessionID;
  }

  public async request<Expected>(req: WRequest): Promise<Res<Expected>> {
    const fullPath = this.base + req.path;
    const { method, query, body, mapper } = req;

    try {
      const url = new URL(fullPath);
      if (query) url.search = new URLSearchParams(query).toString();

      const headers = this.sessionID ? {'x-session-id': this.sessionID} : undefined;
      const init: RequestInit = {method: method ?? 'GET', body, headers, credentials: 'include'};

      const response = await fetch(url, init);
      const statusCode = response.status;

      if (statusCode >= 400) {
        const errorDetails = await response.json();
        const message = errorDetails?.message ?? 'Unknown server side error';
        return {ok: false, data: message, statusCode}
      } else {
        const data = await BaseAPI.mapperDict[mapper ?? 'json'](response);
        return {ok: true, data, statusCode};
      }
    }
    catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown client side error';
      return {ok: false, data: message, statusCode: 400};
    }
  }
}

export const API = new BaseAPI();
