/** Модель параметра клиента, приходящая от сервера (WebRequests). */
export interface ParameterInit {
  id: string;
  type: string;
  value: string | null;
  dependsOn?: string[] | null;
  displayName?: string | null;
  editorType?: string | null;
  editorDisplayOrder?: number | null;
  group?: string | null;
  canBeNull?: boolean | null;
  nullDisplayValue?: string | null;
  showNullValue?: boolean | null;
  externalChannelName?: string | null;
}

/** Массив объектов для обновления значений параметров. */
export type ParameterUpdateEntries = {clientID: ClientID, id: ParameterID, value: any}[];

/** Выражение параметра: вызов какого-либо метода.
 * @example
 * 'date.Year' => {id: 'date', method: 'Year'}
 * 'row.Cell[ID]' => {id: 'row', method: 'Cell', argument: 'ID'}
 */
export interface ParameterExpression {
  /** Идентификатор параметра. */
  id: string;
  /** Вызываемый метод. */
  method: string;
  /** Аргумент метода. */
  argument?: string;
  /** Значение по умолчанию. */
  defaultValue?: string;
}
