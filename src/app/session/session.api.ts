import { BaseAPI, API } from 'shared/lib';
import { SessionToSave } from './session.utils';


export class SessionAPI {
  constructor(private readonly requester: BaseAPI) {}

  private request<Expected>(req: WRequest) {
    return this.requester.request<Expected>(req);
  }

  /** Новая сессия. */
  public startSession(systemID: SystemID, isDefault: boolean): Promise<Res<SessionID>> {
    const query = {systemName: systemID, defaultConfiguration: String(isDefault)};
    return this.request<SessionID>({path: 'startSession', query});
  }

  /** Закрыть сессию. */
  public stopSession(sessionToSave: SessionToSave) {
    const body = JSON.stringify(sessionToSave);
    return this.request<boolean>({method: 'POST', path: 'stopSession', body});
  }

  /** Сохранить состояние текущей сессии. */
  public saveSession(sessionToSave: SessionToSave) {
    const body = JSON.stringify(sessionToSave);
    return this.request<boolean>({method: 'POST', path: 'saveSession', body});
  }

  /** Продлить срок жизни сессии. */
  public iAmAlive() {
    const query = {sessionId: this.requester.sessionID};
    return this.request<boolean>({path: 'iAmAlive', query});
  }
}

export const sessionAPI = new SessionAPI(API);
