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
  public async stopSession(sessionJSON: string): Promise<Res<boolean>> {
    return this.request({method: 'POST', path: 'stopSession', body: sessionJSON});
  }

  /** Сохранить состояние текущей сессии. */
  public async saveSession(sessionJSON: string): Promise<Res<boolean>> {
    return this.request({method: 'POST', path: 'saveSession', body: sessionJSON});
  }

  /** Продлить срок жизни сессии. */
  public async iAmAlive(): Promise<Res<boolean>> {
    const query = {sessionId: this.requester.sessionID};
    return this.request({path: 'iAmAlive', query});
  }
}
