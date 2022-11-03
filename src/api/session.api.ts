import { Requester } from "./api";


export class SessionAPI {
  constructor(private readonly requester: Requester) {}

  private async request<Expected>(req: WRequest) {
    return this.requester.request<Expected>(req);
  }

  /** Новая сессия. */
  public async startSession(systemID: SystemID, isDefault: boolean): Promise<Res<SessionID>> {
    const query = {systemName: systemID, defaultConfiguration: isDefault ? 'true' : 'false'};
    return this.request({path: 'startSession', query});
  }

  /** Закрыть сессию. */
  public async stopSession(session: string): Promise<Res<'true' | 'false'>> {
    return this.request({method: 'POST', path: 'stopSession', body: session});
  }

  /** Сохранить состояние текущей сессии. */
  public async saveSession(session: string): Promise<Res<'true' | 'false'>> {
    return this.request({method: 'POST', path: 'saveSession', body: session});
  }

  /** Продлить срок жизни сессии. */
  public async iAmAlive(sessionID: SessionID): Promise<Res<'true' | 'false'>> {
    return this.request({path: 'iAmAlive', query: {sessionId: sessionID}, mapper: 'text'});
  }
}
