/** Идентификатор сессии. */
type SessionID = string;

/* --- Request --- */

/** Кастомный объект запроса Well Manager.
 * + `method?`: {@link ReqMethod}
 * + `path`: {@link ReqPath}
 * + `query?`: {@link ReqQuery}
 * + `body?`: {@link ReqBody}
 * + `mapper?`: {@link ReqMapper}
 * */
interface WRequest {
  /** HTTP метод запроса. */
  method?: ReqMethod;
  /** Относительный путь. */
  path: ReqPath;
  /** Параметры запроса. */
  query?: ReqQuery | null;
  /** Тело запроса. */
  body?: ReqBody | null;
  /** Тип обработчика ответа. */
  mapper?: ReqMapper;
}

/** Метод HTTP запроса. */
type ReqMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** Относительный путь HTTP запроса. */
type ReqPath = string;

/** Параметры поиска HTTP запроса.
 * @example
 * { sessionID: "...", formID: "..." }
 * */
type ReqQuery = Record<string, string>;

/** Тело HTTP запроса. */
type ReqBody = string | ArrayBuffer;

/** Тип преобразователя ответа.
 * @example
 * "text"   — .then(res => res.text())
 * "json"   — .then(res => res.json())
 * "blob"   — .then(res => res.blob())
 * "buffer" — .then(res => res.arrayBuffer())
 * */
type ReqMapper = 'text' | 'json' | 'blob' | 'buffer';

/* --- Response --- */

/** Кастомный ответ. */
type Res<Expected> = WResponse<Expected> | WErrorResponse;

/** ## Well Manager Response.
 * + `ok: true`
 * + `data: <Data>`
 * */
interface WResponse<Data> {
  /** Флажок. */
  ok: true;
  /** Запрашиваемые данные. */
  data: Data;
  /** HTTP-статус код ответа. */
  statusCode: number;
}

/** Объект ответа, в случае, если произошла ошибка.
 * + `ok: false`
 * + `data: string`
 * */
interface WErrorResponse {
  /** Флажок. */
  ok: false;
  /** Сообщиение ошибки. */
  data: string;
  /** HTTP-статус код ошибки. */
  statusCode: number;
}
