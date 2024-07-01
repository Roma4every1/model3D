import type { Res } from 'shared/lib';
import type { SessionToSave } from './session-save';
import { Fetcher, fetcher } from 'shared/lib';


/** DTO при запросе старта сессии.. */
export interface StartSessionDTO {
  /** ID созданной сессии. */
  id: SessionID;
  /** ID корневого клиента сесиии. */
  root: ClientID;
}


export class AppAPI {
  constructor(private readonly api: Fetcher) {}

  /** Запрос списка доступных систем. */
  public async getSystemList(): Promise<SystemList | null> {
    const path = this.api.legacy ? '/systemList' : '/app/systems';
    const { ok, data } = await this.api.get(path);
    return ok && Array.isArray(data) ? data : null;
  }

  /** Новая сессия. */
  public async startSession(systemID: SystemID, isDefault: boolean): Promise<Res<StartSessionDTO>> {
    if (this.api.legacy) {
      const query = {systemName: systemID, defaultConfiguration: isDefault};
      const resSession = await this.api.get<SessionID>('/startSession', {query});
      if (!resSession.ok) return resSession as any;

      const headers: HeadersInit = {'x-session-id': resSession.data};
      const resRoot = await this.api.get<FormDataWM>('/getRootForm', {headers});
      if (!resRoot.ok) return resRoot as any;
      return {ok: true, data: {id: resSession.data, root: resRoot.data.id}};
    } else {
      const query = {system: systemID, default: isDefault};
      return this.api.get('/session', {query});
    }
  }

  /** Закрыть сессию. */
  public stopSession(sessionToSave: SessionToSave): Promise<Res<boolean>> {
    if (this.api.legacy) {
      return this.api.post('/stopSession', {json: sessionToSave});
    } else {
      return this.api.delete('/session', {query: {save: false}, json: sessionToSave});
    }
  }

  /** Сохранить состояние текущей сессии. */
  public saveSession(sessionToSave: SessionToSave): Promise<Res<boolean>> {
    const path = this.api.legacy ? '/saveSession' : '/session';
    return this.api.post(path, {json: sessionToSave});
  }

  /** Продлить срок жизни сессии. */
  public async extendSession(): Promise<Res<boolean>> {
    if (this.api.legacy) {
      return this.api.get('/iAmAlive');
    } else {
      const res = await this.api.patch('/session');
      if (res.ok) res.data = true;
      return res;
    }
  }
}

export const appAPI = new AppAPI(fetcher);
