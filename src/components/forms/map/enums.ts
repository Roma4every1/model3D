/** ## Режимы редактирования карты.
 * **Общие режимы**:
 * + `NONE` — "ничего"
 * + `SELECTING` — режим выбора элемента
 * + `CREATING` — режим создания элемента
 * + `AWAIT_POINT` — ожидание точки нового элемента
 *
 * **Режимы редактирования элемента**:
 * + `MOVE_MAP` — двигать карту
 * + `MOVE` — переместить элемент
 * + `ROTATE` — повернуть элемент
 *
 * **Режимы редактирования линии/области**:
 * + `MOVE_POINT` — переместить точку
 * + `ADD_END` — добавить точку в конец
 * + `ADD_BETWEEN` — добавить точку
 * + `DELETE_POINT` — удалить точку
 * */
export enum MapModes {
  NONE = -1,
  SELECTING = 0,
  CREATING = 1,
  AWAIT_POINT = 2,

  MOVE_MAP = 10,
  MOVE = 11,
  ROTATE = 12,

  MOVE_POINT = 21,
  ADD_END = 22,
  ADD_BETWEEN = 23,
  DELETE_POINT = 24,
}
