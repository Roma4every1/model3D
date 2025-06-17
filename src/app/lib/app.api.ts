import type { ReqQuery, Res } from 'shared/lib';
import type { SessionToSave } from './session-save';
import { Fetcher, fetcher } from 'shared/lib';


/** DTO при запросе старта сессии.. */
export interface StartSessionDTO {
  /** ID созданной сессии. */
  id: SessionID;
  /** ID корневого клиента сесиии. */
  root: ClientID;
  /** Номер версии серверной части (только для WMW WebRequests). */
  apiVersion?: string;
}

export class AppAPI {
  constructor(private readonly api: Fetcher) {}

  /** Запрос списка доступных систем. */
  public async getSystemList(): Promise<SystemInfo[] | null> {
    const path = this.api.legacy ? '/systemList' : '/app/systems';
    const { ok, data } = await this.api.get(path);
    return ok && Array.isArray(data) ? data : null;
  }

  /** Новая сессия. */
  public async startSession(systemID: SystemID, isDefault: boolean): Promise<Res<StartSessionDTO>> {
    if (this.api.legacy) {
      const query: ReqQuery = {systemName: systemID, defaultConfiguration: isDefault};
      const res = await this.api.get('/startSession', {query});

      if (!res.ok) return res;
      const dto: StartSessionDTO | SessionID = res.data;

      if (typeof dto === 'string') {
        const resRoot = await this.api.get('/getRootForm', {headers: {'x-session-id': dto}});
        if (!resRoot.ok) return resRoot;
        return {ok: true, data: {id: dto, root: resRoot.data.id}};
      } else {
        this.api.version = dto.apiVersion;
        return {ok: true, data: dto};
      }
    } else {
      const query: ReqQuery = {system: systemID, default: isDefault};
      return this.api.get('/session', {query});
    }
  }

  /** Закрыть сессию. */
  public stopSession(sessionToSave?: SessionToSave): Promise<Res<void>> {
    if (this.api.legacy) {
      return this.api.post('/stopSession', {json: sessionToSave, then: null});
    } else {
      return this.api.delete('/session', {json: sessionToSave, then: null});
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
