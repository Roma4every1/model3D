import Ajv from 'ajv';
import { randomInt } from 'shared/lib';


/** Схема валидации входящего сообщения. */
const messageSchema = {
  type: 'object',
  properties: {
    type: {type: 'string'},
    payload: true,
    request: {type: 'number'},
  },
  required: ['type'],
  additionalProperties: false,
};

/** Контроллер обмена сообщениями между экземплярами приложений. */
export class TransportController {
  /** Канал для передачи сообщений. */
  private readonly channel: BroadcastChannel;
  /** Если true, контроллер выполняет роль клиента. */
  private readonly isClient: boolean;

  /** Хранилище ожидающих запросов. */
  private readonly requests: Map<number, PromiseWithResolvers<any>>;
  /** Слушатели входящих запросов. */
  private readonly requestListeners: Map<string, (payload: any) => any>;
  /** Слушатели уведомлений. */
  private readonly notificationListeners: Map<string, EventCallback>;

  constructor(role: 'client' | 'server', channelName: string) {
    this.isClient = role === 'client';
    this.channel = new BroadcastChannel(channelName);
    this.channel.onmessage = (e: MessageEvent) => this.handleMessage(e);

    if (this.isClient) {
      this.requests = new Map();
    } else {
      this.requestListeners = new Map();
    }
    this.notificationListeners = new Map();
  }

  /** Возвращает название {@link BroadcastChannel}. */
  public getChannelName(): string {
    return this.channel.name;
  }

  /** Добавляет слушатель входящих запросов указанного типа. */
  public onRequest(type: string, callback: EventCallback): void {
    if (this.isClient) return;
    this.requestListeners.set(type, callback);
  }

  /** Добавляет слушатель уведомлений указанного типа. */
  public onNotification(type: string, callback: EventCallback): void {
    this.notificationListeners.set(type, callback);
  }

  /* --- --- */

  public broadcast(type: string, payload?: any): void {
    this.channel.postMessage({type, payload});
  }

  public makeRequest(type: string, payload?: any, timeout?: number): Promise<any> {
    const id = randomInt(0, 1_000_000);
    const request = Promise.withResolvers<any>();

    this.requests.set(id, request);
    this.channel.postMessage({type, payload, request: id});

    if (timeout) {
      setTimeout(() => {
        if (this.requests.has(id)) {
          request.reject('timeout');
          this.requests.delete(id);
        }
      }, timeout);
    }
    return request.promise;
  }

  private handleMessage({data}: MessageEvent): void {
    const validator = new Ajv();
    if (!validator.validate(messageSchema, data)) return;
    const { type, payload, request } = data;

    if (request) {
      if (this.isClient) {
        this.handleResponseMessage(request, payload);
      } else {
        this.handleRequestMessage(request, type, payload);
      }
    } else {
      const listener = this.notificationListeners.get(type);
      if (listener) listener(payload);
    }
  }

  private handleRequestMessage(id: number, type: string, payload: any): void {
    const listener = this.requestListeners.get(type);
    const result = listener ? listener(payload) : undefined;
    this.channel.postMessage({type, payload: result, request: id});
  }

  private handleResponseMessage(id: number, payload: any): void {
    const request = this.requests.get(id);
    if (!request) return;
    request.resolve(payload);
    this.requests.delete(id);
  }
}
