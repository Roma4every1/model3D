/** Менеджер сессии. */
interface SessionManager {
  startSession(isDefault?: boolean): Promise<Res<SessionID>>
  stopSession(): Promise<void>
  saveSession(): Promise<void>
  loadSessionByDefault(): Promise<void>
}
