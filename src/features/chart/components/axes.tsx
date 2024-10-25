import type { AxisDomain, AxisInterval } from 'recharts/types/util/types';


export interface YAxisProps {
  key: string;
  yAxisId: string;
  label: YAxisPropsLabel;
  domain?: AxisDomain;
  width: number;
  orientation: 'left' | 'right';
  reversed: boolean;
  stroke: string;
  tickCount?: number;
  interval?: AxisInterval;
  minTickGap?: number;
  padding?: {top: number, bottom: number};
  tickFormatter?: (tick: number | string) => string;
  scale: ScaleTypeCode;
}
export interface YAxisPropsLabel {
  value: string;
  angle: number;
  offset: number;
  position: 'insideLeft' | 'insideRight';
}


/** Строит объект, по которому отрендерится ось из _Recharts_. */
export function getYAxisProto(id: string, axis: AxisSettings): YAxisProps {
  const isLeft = axis.location === 'Left';

  const label: YAxisPropsLabel = {
    value: axis.displayName, angle: isLeft ? -90 : 90,
    offset: 10, position: isLeft ? 'insideLeft' : 'insideRight',
  };

  const tickCount = axis.tickCount ? axis.tickCount + 1 : 11;
  const domain = (axis.max !== null && axis.min !== null) ? [axis.min, axis.max] : getFormattedMinMax;

  const tickFormatter = (tick: number): string => {
    const tickStr = Math.ceil(tick).toString();
    if (tickStr.length <= 3) return tickStr;
    return numberToAbbreviation(tick, 2);
  };

  return {
    key: id, yAxisId: id, domain: domain, tickCount, minTickGap: 0,
    orientation: isLeft ? 'left' : 'right', label,
    stroke: axis.color, reversed: axis.inverse, width: 50, tickFormatter,
    scale: axis.scale,
  };
}

/* --- --- */

/**
 * Возвращает изменненные значения минимума и максимума для оси графика в соответствии
 * с лоигкой подсчета шага на оси графика библиотеки Recharts.
 * @example
 * getFormattedMinMax([1000,25000]) => [0,25000]
 */
export function getFormattedMinMax([dataMin, dataMax]: [number, number]): [number, number] {
  let min = getPragmaticMin(dataMin);
  const max = getPragmaticMax(dataMax);
  const currStep = Math.floor((max - min) / 10);
  if (currStep > min) min = 0;
  return [min, max];
}

/**
 * Конвертирует число в строку в аббревиатурной форме с точностью (количество цифр) precision.
 * @example
 * numberToAbbreviation(1.123, 2) => "1.1"
 * numberToAbbreviation(1230, 2)  => "1.2k"
 * numberToAbbreviation(12330, 3) => "12.3k"
 * numberToAbbreviation(123456)   => "0.12M"
 */
function numberToAbbreviation(n: number, precision: number = 2): string {
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

/* --- --- */

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

/* --- --- */

/**
 * Округляет вниз до ближайшего числа, удобного для восприятия на оси графика.
 * @example
 * getPragmaticMin(4)    => 0
 * getPragmaticMin(33.3) => 25
 * getPragmaticMin(543)  => 500
 */
export function getPragmaticMin(n: number): number {
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
export function getPragmaticMax(n: number): number {
  n = Math.ceil(n);
  const e = Math.pow(10, n.toString().length - 1);
  n = n / e;

  if (n <= 1) return e;
  if (e < 2 && n <= 2) return 2 * e;
  if (n <= 2.5) return 2.5 * e;
  return (n <= 5 ? 5 : 10) * e;
}

// // http://gs-git.gs/geospline/wmw/src/branch/master/WellManager.ChartClient/Extensions/ChartAxisCalculatorPlugin/ChartAxisCalculator.cs
// function calcAxisDomain(axis: AxisSettings, min: number, max: number): [number, number] {
//   if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 0];
//   if (axis.min !== null) min = axis.min;
//   if (axis.max !== null) max = axis.max;
//   let actualMin = 0, actualMax = 0;
//
//   let diff = max - min;
//   if (diff === 0) diff = 1;
//   const d = Math.floor(Math.log10(diff));
//
//   const steps = [
//     Math.pow(10, d - 2), 2 * Math.pow(10, d - 2), 2.5 * Math.pow(10, d - 2), 5 * Math.pow(10, d - 2),
//     Math.pow(10, d - 1), 2 * Math.pow(10, d - 1), 2.5 * Math.pow(10, d - 1), 5 * Math.pow(10, d - 1),
//     Math.pow(10, d), 2 * Math.pow(10, d), 2.5 * Math.pow(10, d), 5 * Math.pow(10, d),
//     Math.pow(10, d + 1), 2 * Math.pow(10, d + 1), 2.5 * Math.pow(10, d + 1), 5 * Math.pow(10, d + 1),
//     Math.pow(10, d + 2), 2 * Math.pow(10, d + 2), 2.5 * Math.pow(10, d + 2), 5 * Math.pow(10, d + 2),
//   ];
//
//   const ticksCount = axis.tickCount ?? 8;
//   let step = minExt(steps, x => Math.abs(diff / x - ticksCount));
//
//   if (axis.tickCount !== null) {
//     diff = diff + diff / ticksCount;
//     step = minExt(steps.filter(x => diff / x - ticksCount <= 0), x => Math.abs(diff / x - ticksCount));
//   }
//
//   if (axis.min === null && axis.max === null) {
//     actualMin = Math.floor(min / step) * step;
//
//     if (axis.tickCount == null) {
//       actualMax = (Math.floor(max / step) + 1) * step;
//     } else {
//       actualMax = actualMin + step * axis.tickCount;
//     }
//   } else if (axis.min !== null && axis.max === null) {
//     actualMin = axis.min;
//
//     if (axis.tickCount === null) {
//       actualMin = actualMin + (Math.floor((max - actualMin) / step) + 1) * step;
//     } else {
//       actualMax = actualMin + step * axis.tickCount;
//     }
//   } else if (axis.max !== null && axis.min === null) {
//     actualMax = axis.max;
//
//     if (axis.tickCount === null) {
//       actualMin = actualMin - (Math.floor((actualMin - max) / step) + 1) * step;
//     } else {
//       actualMax = actualMax - step * axis.tickCount;
//     }
//   } else {
//     actualMin = axis.min;
//     actualMax = axis.max;
//   }
//   return [actualMin, actualMax];
// }
//
// function minExt(source: number[], comparerSelector: (n: number) => number): number {
//   let cur = Infinity;
//   let result = 0;
//
//   for (let sourceItem of source) {
//     const value = comparerSelector(sourceItem);
//     if (value < cur) {
//       cur = value;
//       result = sourceItem;
//     }
//   }
//   return result;
// }
