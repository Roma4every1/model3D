/** Сокращения месяцов на русском языке. */
const ruMonths = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

/**
 * Конвертирует строку даты в формат `mon YYYY`.
 * @example
 * toMonYear(new Date("2023-01-03T07:25:40")) => "янв 2023"
 */
export function toMonYear(date: Date): string {
  return ruMonths[date.getMonth()] + ' ' + date.getFullYear();
}
/**
 * Конвертирует строку даты в формат `YYYY`.
 * @example
 * toYear(new Date("2023-01-03T07:25:40")) => "2023"
 */
export function toYear(date: Date): string {
  return date.getFullYear().toString();
}

export function monthStep(date: Date): number {
  return date.getFullYear() * 12 + date.getMonth();
}
export function yearStep(date: Date): number {
  return date.getFullYear();
}
