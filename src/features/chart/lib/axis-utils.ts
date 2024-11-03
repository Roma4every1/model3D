import type { ChartAxis, ChartAxisDomain } from './chart.types';


export function getAxisDomain({min, max}: ChartAxis): ChartAxisDomain {
  if (min === null) {
    if (max === null) {
      return getFormattedMinMax;
    } else {
      return [getPragmaticMin, max];
    }
  } else {
    if (max === null) {
      return [min, getPragmaticMax];
    } else {
      return [min, max];
    }
  }
}

/**
 * Возвращает изменненные значения минимума и максимума для оси графика в соответствии
 * с лоигкой подсчета шага на оси графика библиотеки Recharts.
 * @example
 * getFormattedMinMax([1000, 25000]) => [0, 25000]
 */
function getFormattedMinMax([dataMin, dataMax]: [number, number]): [number, number] {
  let min = getPragmaticMin(dataMin);
  const max = getPragmaticMax(dataMax);
  const currStep = Math.floor((max - min) / 10);
  if (currStep > min) min = 0;
  return [min, max];
}

/**
 * Округляет вниз до ближайшего числа, удобного для восприятия на оси графика.
 * @example
 * getPragmaticMin(4)    => 0
 * getPragmaticMin(33.3) => 25
 * getPragmaticMin(543)  => 500
 */
function getPragmaticMin(n: number): number {
  n = Math.floor(n);
  if (n < 10) return 0;
  const e = Math.pow(10, n.toString().length - 1);
  n = n / e;

  if (n >= 5) return 5 * e;
  if (n >= 2.5) return 2.5 * e;
  return (n >= 2 ? 2 : 1) * e;
}

/**
 * Округляет вверх до ближайшего числа, удобного для восприятия на оси графика.
 * @example
 * getPragmaticMax(4)    => 5
 * getPragmaticMax(33.3) => 50
 * getPragmaticMax(543)  => 1000
 */
function getPragmaticMax(n: number): number {
  n = Math.ceil(n);
  const e = Math.pow(10, n.toString().length - 1);
  n = n / e;

  if (n <= 1) return e;
  if (e < 2 && n <= 2) return 2 * e;
  if (n <= 2.5) return 2.5 * e;
  return (n <= 5 ? 5 : 10) * e;
}

/* --- --- */

export function tickFormatter(tick: number): string {
  const tickStr = Math.ceil(tick).toString();
  if (tickStr.length <= 3) return tickStr;
  return numberToAbbreviation(tick, 2);
}

/**
 * Конвертирует число в строку в аббревиатурной форме с точностью (количество цифр) precision.
 * @example
 * numberToAbbreviation(1.123, 2) => "1.1"
 * numberToAbbreviation(1230, 2)  => "1.2k"
 * numberToAbbreviation(12330, 3) => "12.3k"
 * numberToAbbreviation(123456)   => "0.12M"
 */
function numberToAbbreviation(n: number, precision: number): string {
  const digits = Math.round(n).toString().length; // количество цифр

  if (digits <= 3) {
    if (digits <= precision) return n.toFixed(precision - digits); // менее 3 цифр
    else return Math.round(n).toString(); // 3 цифры
  }

  let rank = 'k';
  let rankNum = 3;

  if (digits >= 9) {
    rank = 'B';
    rankNum = 9;
  } else if (digits >= 6) {
    rank = 'M';
    rankNum = 6;
  } else if (digits >= 3) {
    rankNum = 3;
    rank = 'k';
  }
  // результирующее число при более 3 цифр
  const resultNumber = (n / Math.pow(10, rankNum));
  // количество цифр в результирующем числе
  const resultDigitsAmount = precision - ((digits - rankNum) || 1);

  return resultNumber.toFixed(resultDigitsAmount).toString() + rank;
}
