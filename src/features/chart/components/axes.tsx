import { AxisDomain, AxisInterval } from 'recharts/types/util/types';


export interface YAxisProps {
  key: string,
  yAxisId: string,
  label: YAxisPropsLabel,
  domain?: AxisDomain,
  width: number,
  orientation: 'left' | 'right',
  reversed: boolean,
  stroke: string,
  tickCount?: number,
  interval?: AxisInterval,
  minTickGap?: number,
  padding?: {top: number, bottom: number},
  tickFormatter?(tick: number | string): string
}

export interface YAxisPropsLabel {
  value: string,
  angle: number,
  position: 'insideLeft' | 'insideRight',
  offset: number,
}


/** Строит объект, по которому отрендерится ось из _Recharts_. */
export const getYAxisProto = (id: string, axis: AxisSettings): YAxisProps => {
  const isLeft = axis.location === 'Left';

  const label: YAxisPropsLabel = {
    value: axis.displayName, angle: isLeft ? -90 : 90,
    position: isLeft ? 'insideLeft' : 'insideRight', offset: 10,
  };

  const tickCount = axis.tickCount ? axis.tickCount + 1 : 11;
  const domain = (axis.max !== null && axis.min !== null) ? [axis.min, axis.max] : getFormattedMinMax;

  const tickFormatter = (tick) => {
    const tickStr = Math.ceil(tick).toString();
    if (tickStr.length <= 3) return tickStr;
    return numberToAbbreviation(tick, 2);
  };

  return {
    key: id, yAxisId: id, domain: domain, tickCount, minTickGap: 0,
    orientation: isLeft ? 'left' : 'right', label,
    stroke: axis.color, reversed: axis.inverse, width: 50, tickFormatter,
  };
};

/* --- --- */

/** Возвращает изменненные значения минимума и максимума для оси графика в соответствии
 * с лоигкой подсчета шага на оси графика библиотеки Recharts
 * @example
 * getFormattedMinMax([1000,25000])    => [0,25000]
 * */
const getFormattedMinMax = ([dataMin, dataMax] : [number, number]) => {
  let min = getMin(dataMin);
  let max = getMax(dataMax);
  const currStep = Math.floor((max - min) / 10);
  if (currStep > min) min = 0;
  return [min, max] as [number, number];
};

/** Округляет в низ до ближайшего числа, удобного для восприятия на оси графика.
 * @example
 * getMin(4)    => 0
 * getMin(33.3) => 25
 * getMin(543)  => 500
 * */
const getMin = (n: number): number => {
  n = Math.floor(n);
  if (n < 10) return 0;
  const e = Math.pow(10, n.toString().length - 1);
  n = n / e;

  if (n >= 5) return 5 * e;
  if (n >= 2.5) return 2.5 * e;
  return (n >= 2 ? 2 : 1) * e;
};

/** Округляет в вверх до ближайшего числа, удобного для восприятия на оси графика.
 * @example
 * getMax(4)    => 5
 * getMax(33.3) => 50
 * getMax(543)  => 1000
 * */
const getMax = (n: number): number => {
  n = Math.ceil(n);
  const e = Math.pow(10, n.toString().length - 1);
  n = n / e;

  if (n <= 1) return e;
  if (e < 2 && n <= 2) return 2 * e;
  if (n <= 2.5) return 2.5 * e;
  return (n <= 5 ? 5 : 10) * e;
}

/** Конвертирует число в строку в аббревиатурной форме с точностью (количество цифр) precision.
 * @example
 * numberToAbbreviation(1.123, 2) => "1.1"
 * numberToAbbreviation(1230, 2)  => "1.2k"
 * numberToAbbreviation(12330, 3) => "12.3k"
 * numberToAbbreviation(123456)   => "0.12M"
 * */
const numberToAbbreviation = (n: number, precision: number = 2): string => {
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
};

/* --- --- */

/** Сокращения месяцов на русском языке. */
const ruMonths = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

/** Конвертирует строку даты в формат `mon YYYY`.
 * @example
 * toMonYear(new Date("2023-01-03T07:25:40")) => "янв 2023"
 * */
export const toMonYear = (date: Date): string => {
  return ruMonths[date.getMonth()] + ' ' + date.getFullYear();
};
export const monthStep = (date: Date): number => {
  return date.getFullYear() * 12 + date.getMonth();
};

/** Конвертирует строку даты в формат `YYYY`.
 * @example
 * toYear(new Date("2023-01-03T07:25:40")) => "2023"
 * */
export const toYear = (date: Date): string => {
  return date.getFullYear().toString();
};
export const yearStep = (date: Date): number => {
  return date.getFullYear();
};
