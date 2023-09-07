interface IBaseAPI {
  setBase(base: string): void
  setRoot(root: string): void
  setSessionID(sessionID: SessionID): void

  request<Expected>(req: WRequest): Promise<Res<Expected>>
}


export class BaseAPI implements IBaseAPI {
  public base: string = '/';
  public root: string = '/';
  public sessionID: SessionID = '';

  public static mapperDict = {
    'text': (res: Response) => res.text(),
    'json': (res: Response) => res.json(),
    'blob': (res: Response) => res.blob(),
    'buffer': (res: Response) => res.arrayBuffer(),
  };

  public setBase(base: string): void {
    this.base = base;
  }
  public setRoot(root: string): void {
    this.root = root;
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

      const init: RequestInit = {body, method: method ?? 'GET', credentials: 'include'};
      const onFulfilled = BaseAPI.mapperDict[mapper ?? 'json'];
      const response = await fetch(url, init).then(onFulfilled);

      if (response.error === true) return {ok: false, data: response.message || 'Server side error'};
      return {ok: true, data: response};
    }
    catch (error) {
      console.warn('Fetch error: ' + fullPath);
      console.warn(error);
      return {ok: false, data: error instanceof Error ? error.message : 'Unknown error'};
    }
  }
}

export const API = new BaseAPI();
