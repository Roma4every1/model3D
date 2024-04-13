import { Res, Fetcher, fetcher } from 'shared/lib';
import { SessionToSave } from './session-save';


export class AppAPI {
  constructor(private readonly api: Fetcher) {}

  /** Запрос списка доступных систем. */
  public async getSystemList(): Promise<SystemList | null> {
    const { ok, data } = await this.api.get('/systemList');
    return ok && Array.isArray(data) ? data : null;
  }

  /** Новая сессия. */
  public startSession(systemID: SystemID, isDefault: boolean): Promise<Res<SessionID>> {
    const query = {systemName: systemID, defaultConfiguration: isDefault};
    return this.api.get('/startSession', {query});
  }

  /** Закрыть сессию. */
  public stopSession(sessionToSave: SessionToSave): Promise<Res<boolean>> {
    return this.api.post('/stopSession', {json: sessionToSave});
  }

  /** Сохранить состояние текущей сессии. */
  public saveSession(sessionToSave: SessionToSave): Promise<Res<boolean>> {
    return this.api.post('/saveSession', {json: sessionToSave});
  }

  /** Продлить срок жизни сессии. */
  public extendSession(): Promise<Res<boolean>> {
    return this.api.get('/iAmAlive');
  }
}

export const appAPI = new AppAPI(fetcher);
