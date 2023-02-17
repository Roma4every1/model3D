import {AxisDomain, AxisInterval} from "recharts/types/util/types";

export interface YAxisProps {
  key: string,
  yAxisId: string,
  label: YAxisPropsLabel,
  domain: AxisDomain,
  width: number,
  orientation: 'left' | 'right',
  reversed: boolean,
  stroke: string,
  tickCount: number,
  interval?: AxisInterval,
  minTickGap?: number,
  tickFormatter? (tick: number | string):  string
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
  const min = axis.min !== null ? axis.min : (x: number) => getMin(x);
  const max = axis.max !== null ? axis.max : (x: number) => getMax(x);

  const label: YAxisPropsLabel = {
    value: axis.displayName, angle: isLeft ? -90 : 90,
    position: isLeft ? 'insideLeft' : 'insideRight', offset: 10,
  };

  // const getTicks = () => {
  //     let ticks = []
  //     const step = Math.floor((max - min) / (axis.tickCount || 12))
  //     for (let i = min; i < max; i+=step) {
  //         ticks.push(i)
  //     }
  // }

  const tickFormatter = (tick) => tick.toString().length <= 3 ?
      tick
      : numberToAbbreviatedStringFormatter(tick, 2)

  return {
    key: id, yAxisId: id, domain: [min, max], tickCount: axis.tickCount || 10, interval: 0,
    orientation: isLeft ? 'left' : 'right', label,
    stroke: axis.color, reversed: axis.inverse, width: 50, tickFormatter: tickFormatter,
  };
};

/* --- --- */

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
}

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

/** Конвертирует число в строку в аббревиатурной форме с точностью (количество цифр) precision.
 * @example
 * numberToAbbreviatedStringFormatter(1230) => "1.2k"
 * */
const numberToAbbreviatedStringFormatter = (n: number, precision: number = 2) : string => {
    const digits = n.toString().length;
    let rank: string = 'u';
    let rankNum = 3;
    if (digits <= precision) return n.toString();
    if (digits > 12) {
        rank = 'b'
        rankNum = 12
    }
    else if (digits > 9) {
        rank = 'b'
        rankNum = 9
    }
    else if (digits > 6) {
        rank = 'm'
        rankNum = 6
    }
    else if (digits > 3) {
        rankNum = 3
        rank = 'k'
    }
    return (n / Math.pow(10,rankNum)).toPrecision(precision) + rank
}
