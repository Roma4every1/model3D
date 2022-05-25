import {toDate} from "../../../utils";


/** Округляет в низ до ближайшего числа, удобного для восприятия на оси графика.
 * @example
 * 4     => 0
 * 33.3  => 25
 * 543   => 500
 * @see getYAxisDomain
 * */
const getMin = (n: number): number => {
  n = Math.floor(n);
  if (n < 10) return 0;
  let e = Math.pow(10, n.toString().length - 1);
  n = n / e;

  if (n >= 5) return 5 * e;
  if (n >= 2.5) return 2.5 * e;
  return (n >= 2 ? 2 : 1) * e;
}

/** Округляет в вверх до ближайшего числа, удобного для восприятия на оси графика.
 * @example
 * 4     => 5
 * 33.3  => 50
 * 543   => 1000
 * @see getYAxisDomain
 * */
const getMax = (n: number): number => {
  n = Math.ceil(n);
  let e = Math.pow(10, n.toString().length - 1);
  n = n / e;

  if (n <= 1) return e;
  if (e < 2 && n <= 2) return 2 * e;
  if (n <= 2.5) return 2.5 * e;
  return (n <= 5 ? 5 : 10) * e;
}

/** Находит область определения оси (`domain`) и количество засечек оси (`tickCount`). */
export const getYAxisDomain = (dataMin, dataMax, tickCount) => {
  if (typeof tickCount === 'string') {
    tickCount = parseInt(tickCount) + 2;
    if (isNaN(tickCount)) tickCount = 12;
  } else {
    tickCount = 12;
  }

  const isMin = typeof dataMin === 'string';
  const isMax = typeof dataMax === 'string';

  dataMin = isMin ? parseInt(dataMin) : (x) => getMin(x);
  dataMax = isMax ? parseInt(dataMax) : (x) => getMax(x);

  return [[dataMin, dataMax], tickCount];
}


/** Сокращения месяцов на русском языке.
 * @see toMonYear
 * */
const ruMonth = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

/** Конвертирует строку из серверного формата в формат `mon YYYY`.
 * @example
 * "/Date(1391202000000+0300)/" => "янв 2014"
 * */
export const toMonYear = (date): string => {
  date = toDate(date);
  return ruMonth[date.getMonth()] + ' ' + date.getFullYear();
}

/** Конвертирует строку из серверного формата в формат `YYYY`.
 * @example
 * "/Date(1391202000000+0300)/" => "2014"
 * */
export const toYear = (date: string) => {
  return toDate(date).getFullYear();
}

/** Конвертирует объект, задающий цвет в CSS-свойство цвета.
 * @example
 * {"A": "255", "R": "70", "G": "70", "B": "70"} => "rgba(70,70,70,255)"
 * */
export const toColor = (colorParams: {R: string, G: string, B: string, A: string}): string => {
  return `rgba(${colorParams.R},${colorParams.G},${colorParams.B},${colorParams.A})`;
}
