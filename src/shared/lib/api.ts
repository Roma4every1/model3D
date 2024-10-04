/** Обёртка над HTTP-ответом. */
export interface Res<T = any> {
  /** `true` если статус код ответа `2xx`. */
  ok: boolean;
  /** Объект ответа от `fetch`; не задан если произошла клиентская ошибка. */
  raw?: Response;
  /** Преобразованное тело ответа. */
  data?: T;
  /** Сообщение ошибки, если `ok === false`. */
  message?: string;
}

/** Настройки HTTP-запроса. */
export interface ReqOptions {
  /** Поисковые URL-параметры. */
  query?: ReqQuery;
  /** Заголовки запроса. */
  headers?: HeadersInit;
  /** Тело запроса в формате JSON. */
  json?: object;
  /** Тело запроса в формате обычного текста. */
  text?: string;
  /** Тело запроса в бинарном формате. */
  blob?: Blob | ArrayBuffer;
  /** Тип обработчика ответа. */
  then?: ReqHandlerKind | null;
  /** Сигнал для прекращения запроса. */
  signal?: AbortSignal;
  /** Время в миллисекундах, в течение которого ожидается ответ. */
  timeout?: number;
}

/** Метод HTTP запроса. */
export type ReqMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** Поисковые URL-параметры. */
export type ReqQuery = Record<string, string | number | boolean>;

/** Вид обработчика тела ответа.
 * @example
 * response.text()
 * response.json()
 * response.blob()
 * response.arrayBuffer()
 */
export type ReqHandlerKind = 'text' | 'json' | 'blob' | 'arrayBuffer';

/* --- --- */

interface IFetcher {
  setPrefix(prefix: string): void;
  setSessionID(sessionID: SessionID): void;

  get<T>(path: string, options?: ReqOptions): Promise<Res<T>>;
  post<T>(path: string, options?: ReqOptions): Promise<Res<T>>;
  put<T>(path: string, options?: ReqOptions): Promise<Res<T>>;
  patch<T>(path: string, options?: ReqOptions): Promise<Res<T>>;
  delete<T>(path: string, options?: ReqOptions): Promise<Res<T>>;
}

export class Fetcher implements IFetcher {
  /** Используется ли WMW WebRequests. */
  public legacy: boolean;
  /** Префикс URL для всех запросов. */
  private prefix: string;
  /** ID текущей сессии (добавляется в заголовки). */
  private sessionID: SessionID;

  public setPrefix(prefix: string): void {
    if (prefix.endsWith('/')) prefix = prefix.slice(0, -1);
    this.prefix = prefix;
    this.legacy = prefix.includes('WebRequests');
  }
  public setSessionID(sessionID: SessionID): void {
    this.sessionID = sessionID;
  }

  public get<T = any>(path: string, o?: ReqOptions): Promise<Res<T>> {
    return this.request('GET', path, o);
  }
  public post<T = any>(path: string, o?: ReqOptions): Promise<Res<T>> {
    return this.request('POST', path, o);
  }
  public put<T = any>(path: string, o?: ReqOptions): Promise<Res<T>> {
    return this.request('PUT', path, o);
  }
  public patch<T = any>(path: string, o?: ReqOptions): Promise<Res<T>> {
    return this.request('PATCH', path, o);
  }
  public delete<T = any>(path: string, o?: ReqOptions): Promise<Res<T>> {
    return this.request('DELETE', path, o);
  }

  private async request(method: ReqMethod, path: string, options?: ReqOptions): Promise<Res> {
    let query: ReqQuery;
    let body: BodyInit;
    let headers: HeadersInit;
    let signal: AbortSignal;
    let then: ReqHandlerKind | null;

    if (options) {
      query = options.query;
      then = options.then;
      headers = options.headers ?? {};

      const contentType = headers['content-type'];
      if (options.json) {
        body = JSON.stringify(options.json);
        if (!contentType && !this.legacy) headers['content-type'] = 'application/json';
      } else if (options.text) {
        body = options.text;
        if (!contentType && !this.legacy) headers['content-type'] = 'text/plain';
      } else if (options.blob) {
        body = options.blob;
        if (!contentType && !this.legacy) headers['content-type'] = 'application/octet-stream';
      }

      if (options.signal) {
        signal = options.signal;
      } else if (options.timeout) {
        const controller = new AbortController();
        signal = controller.signal;
        setTimeout(() => controller.abort(), options.timeout);
      }
    }
    if (this.sessionID) {
      if (!headers) headers = {};
      headers['x-session-id'] = this.sessionID;
    }

    try {
      const url = new URL(this.prefix + path);
      if (query) url.search = new URLSearchParams(query as any).toString();

      const init: RequestInit = {method, headers, body, signal, credentials: 'include'};
      const response = await fetch(url, init);
      const ok = response.ok;

      if (ok) {
        const res: Res = {ok, raw: response};
        if (then === null) return res;
        if (then) { res.data = await response[then](); return res; }

        const contentType = response.headers.get('content-type');
        if (!contentType) return res;

        if (contentType.startsWith('application/json')) {
          res.data = await response.json();
        } else if (contentType.startsWith('application/octet-stream')) {
          res.data = await response.blob();
        } else if (contentType.startsWith('text')) {
          res.data = await response.text();
        }
        return res;
      } else {
        const errorDetails = await response.json();
        const message = errorDetails?.message || 'Неизвестная ошибка';
        return {ok, raw: response, message}
      }
    }
    catch (e) {
      if (e instanceof DOMException) throw e; // aborted
      return {ok: false, message: e.message};
    }
  }
}

export const fetcher = new Fetcher();
