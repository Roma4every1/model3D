import { Requester } from "./api";
import { SessionToSave } from "../utils/session.utils";


export class SessionAPI {
  constructor(private readonly requester: Requester) {}

  private async request<Expected>(req: WRequest) {
    return this.requester.request<Expected>(req);
  }

  /** Новая сессия. */
  public async startSession(systemID: SystemID, isDefault: boolean): Promise<Res<SessionID>> {
    const query = {systemName: systemID, defaultConfiguration: String(isDefault)};
    return await this.request<SessionID>({path: 'startSession', query});
  }

  /** Закрыть сессию. */
  public async stopSession(sessionToSave: SessionToSave) {
    const body = JSON.stringify(sessionToSave);
    return await this.request<boolean>({method: 'POST', path: 'stopSession', body});
  }

  /** Сохранить состояние текущей сессии. */
  public async saveSession(sessionToSave: SessionToSave) {
    const body = JSON.stringify(sessionToSave);
    return await this.request<boolean>({method: 'POST', path: 'saveSession', body});
  }

  /** Продлить срок жизни сессии. */
  public async iAmAlive() {
    const query = {sessionId: this.requester.sessionID};
    return await this.request<boolean>({path: 'iAmAlive', query});
  }
}
