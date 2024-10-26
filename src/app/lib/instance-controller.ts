import type { ParameterUpdateData } from 'entities/parameter';
import { TransportController } from './transport';
import { useParameterStore, updateParamsDeep } from 'entities/parameter';


/** Пара вида "имя + значение". */
interface ParameterDTO {
  /** Название параметра. */
  name: ParameterName;
  /** Значение параметра. */
  value: any;
}

/**
 * Типы сообщений для обмена между экземплярами приложений.
 * + `init` — initialize parameters
 * + `ugp` — update global parameters
 */
type BroadcastMessageType = 'init' | 'ugp';


/** Контроллер экземпляров приложения. */
export class InstanceController {
  /** Если true, это главный экземпляр. */
  public readonly main: boolean;
  /** Параметр окна, переданный главным приложением; иначе `null`. */
  public readonly windowParameter: string | null;
  /** Контроллер передачи сообщений. */
  private readonly transport: TransportController;
  /** Дочерние экземпляры. */
  private children: Window[];

  constructor() {
    const match = window.opener && window.name.match(/^(wm_\d+)_(.*)/);
    if (match) {
      this.main = false;
      this.windowParameter = match[2];
      this.transport = new TransportController('client', match[1]);
    } else {
      this.main = true;
      this.windowParameter = null;
      this.transport = new TransportController('server', 'wm_' + Date.now());
      this.addRequestListeners();
    }
    this.children = [];
    this.addNotificationListeners();
  }

  /** Открывает, связанный с указанной презентацией. */
  public openPopup(presentation: ClientID): boolean {
    if (!this.main) return;
    const name = this.transport.getChannelName() + '_' + presentation;
    const child = window.open(window.location.pathname, name, this.getWindowFeatures());
    if (child) this.children.push(child);
    return child !== null;
  }

  /** Уничтожает все дочерние экземпляры приложений. */
  public destroy(): void {
    for (const childWindow of this.children) {
      if (!childWindow.closed) childWindow.close();
    }
    this.children = [];
  }

  /** Проверяет наличие дочерних экземпляров. */
  public empty(): boolean {
    return this.children.length === 0;
  }

  private getWindowFeatures(): string {
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;

    const width = Math.round(screenWidth / 2);
    const height = Math.round(screenHeight / 2);
    const top = Math.round((screenHeight - height) / 2);
    const left = Math.round((screenWidth - width) / 2);
    return `popup=yes,width=${width},height=${height},top=${top},left=${left}`;
  }

  /* --- Data Exchange --- */

  /** Отправляет сообщение всем связанным экземпрярам приложений. */
  public broadcast(type: BroadcastMessageType, payload: any): void {
    this.children = this.children.filter(c => !c.closed);
    this.transport.broadcast(type, payload);
  }

  /** Отправка сообщения от дочернего экземпляра к главному. */
  public sendRequest<T = any>(type: BroadcastMessageType, payload?: any): Promise<T> {
    return this.transport.makeRequest(type, payload, 5_000);
  }

  private addNotificationListeners(): void {
    this.transport.onNotification('ugp', (payload: ParameterDTO[]) => {
      const updateData: ParameterUpdateData[] = [];
      const globalParameters = useParameterStore.getState().clients.root;

      for (const { name, value } of payload) {
        const parameter = globalParameters.find(p => p.name === name);
        if (parameter) updateData.push({id: parameter.id, newValue: value});
      }
      if (updateData.length) {
        updateParamsDeep(updateData, false).then();
      }
    });
  }

  private addRequestListeners(): void {
    this.transport.onRequest('init', (id: ClientID) => {
      const toDTO = (p: Parameter): ParameterDTO => {
        return {name: p.name, value: p.getValue()};
      };
      return useParameterStore.getState().clients[id].map(toDTO);
    });
  }
}
