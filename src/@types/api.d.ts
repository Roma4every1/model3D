/* --- Well Manager Custom Request --- */

/** ## Well Manager API Request.
 *
 * Кастомный объект запроса.
 * + `method?`: {@link ReqMethod} — метод запроса
 * + `path`: {@link ReqPath} — относительный путь
 * + `query?`: {@link ReqQuery} — параметры
 * + `body?`: {@link ReqBody} — тело запроса
 * + `mapper?`: {@link ReqMapper} — тип обработчика
 * */
interface WRequest {
  method?: ReqMethod,
  path: ReqPath,
  query?: ReqQuery,
  body?: ReqBody,
  mapper?: ReqMapper
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

/* --- Well Manager Custom Response --- */

/** Кастомный ответ. */
type Res<Expected> = WResponse<Expected> | WErrorResponse;

/** ## Well Manager Response.
 * + `ok: true` — флажок
 * + `data: <Data>` — запрашиваемые данные
 * */
interface WResponse<Data> {
  ok: true,
  data: Data,
}

/** Объект ответа, в случае, если произошла ошибка.
 * + `ok: false` — флажок
 * + `data: string` — сообщение ошибки
 * */
interface WErrorResponse {
  ok: false,
  data: string,
}
