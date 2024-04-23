interface FetchStates {
  session: FetchState;
  forms: Record<ClientID, FetchState>;
}

/** Состояние загружаемых данных.
 * + `ok` — успешно ли
 * + `loading` — загрузилось ли
 * + `errors` — загруженные данные
 * + `progress?` — процент загрузки
 * @example
 * { loading: true, ok: undefined, errors: null } // загружается...
 * { loading: false, ok: true, errors: null }     // успешная загрузка
 * { loading: false, ok: false, errors: ... }  // неудачная загрузка
 * */
type FetchState = FetchStateSuccess | FetchStateError | FetchStateWait;

/** Состояние успешной загрузки. */
interface FetchStateSuccess {
  ok: true;
  loading: false;
  details: any;
  progress?: number;
}

/** Состояние неудачной загрузки. */
interface FetchStateError {
  ok: false;
  loading: false;
  details: any;
  progress?: number;
}

/** Состояние перед загрузкой. */
interface FetchStateWait {
  ok: undefined;
  loading: boolean;
  details: null;
  progress?: number;
}
