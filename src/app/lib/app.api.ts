import { BaseAPI, API } from 'shared/lib';
import { SessionToSave } from './session-save';


export class AppAPI {
  constructor(private readonly baseAPI: BaseAPI) {}

  /** Запрос списка доступных систем. */
  public async getSystemList(): Promise<SystemWMR[] | null> {
    const { ok, data } = await this.baseAPI.request<any[]>({path: 'systemList'});
    return ok && Array.isArray(data)
      ? data.map((rawSystem) => ({id: rawSystem['Name'], ...rawSystem['Attributes']}))
      : null;
  }

  /** Новая сессия. */
  public startSession(systemID: SystemID, isDefault: boolean): Promise<Res<SessionID>> {
    const query = {systemName: systemID, defaultConfiguration: String(isDefault)};
    return this.baseAPI.request<SessionID>({path: 'startSession', query});
  }

  /** Закрыть сессию. */
  public stopSession(sessionToSave: SessionToSave) {
    const body = JSON.stringify(sessionToSave);
    return this.baseAPI.request<boolean>({method: 'POST', path: 'stopSession', body});
  }

  /** Сохранить состояние текущей сессии. */
  public saveSession(sessionToSave: SessionToSave) {
    const body = JSON.stringify(sessionToSave);
    return this.baseAPI.request<boolean>({method: 'POST', path: 'saveSession', body});
  }

  /** Продлить срок жизни сессии. */
  public extendSession() {
    const query = {sessionId: this.baseAPI.sessionID};
    return this.baseAPI.request<boolean>({path: 'iAmAlive', query});
  }
}

export const appAPI = new AppAPI(API);
