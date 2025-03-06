import type { ChartAxis, ChartAxisDomain } from './chart.types';


/** Функция для форматирования подписей значений на графике. */
export function chartValueFormatter(value: number): string {
  return (Math.round(value * 1000) / 1000).toString();
}

export function tickFormatter(n: number): string {
  if (n === 0) return '0';
  if (n < 0) return '-' + tickFormatter(-n);

  if (n >= 0.001) {
    if (n < 1) return (Math.round(n * 1000) / 1000).toString();
    if (n < 9) return (Math.round(n * 100) / 100).toString();
    if (n < 99) return (Math.round(n * 10) / 10).toString();
    if (n < 9999) return Math.round(n).toString();
    if (n < 999_500) return Math.round(n / 1000) + 'т';
  }
  let s = n.toExponential(1);
  if (s.charCodeAt(2) === 0x30) s = s.charAt(0) + s.substring(3);
  return s;
}

/* --- --- */

/** @see http://gs-git.gs/geospline/wmw/src/branch/master/WellManager.ChartClient/Extensions/ChartAxisCalculatorPlugin/ChartAxisCalculator.cs */
export function calcAxisDomain(axis: ChartAxis): {domain: ChartAxisDomain, ticks: number[]} {
  let actualMin = axis.actualMin;
  let actualMax = axis.actualMax;
  let actualStep: number;

  let min = actualMin;
  let max = actualMax;
  if (axis.min !== null) min = axis.min;
  if (axis.max !== null) max = axis.max;

  let diff = max - min;
  if (diff === 0) diff = 1;

  if (axis.half) {
    max += diff;
    diff *= 2;
  }
  const d = Math.floor(Math.log10(Math.abs(diff)));
  const steps = [
    Math.pow(10, d - 2), 2 * Math.pow(10, d - 2), 2.5 * Math.pow(10, d - 2), 5 * Math.pow(10, d - 2),
    Math.pow(10, d - 1), 2 * Math.pow(10, d - 1), 2.5 * Math.pow(10, d - 1), 5 * Math.pow(10, d - 1),
    Math.pow(10, d    ), 2 * Math.pow(10, d    ), 2.5 * Math.pow(10, d    ), 5 * Math.pow(10, d    ),
    Math.pow(10, d + 1), 2 * Math.pow(10, d + 1), 2.5 * Math.pow(10, d + 1), 5 * Math.pow(10, d + 1),
    Math.pow(10, d + 2), 2 * Math.pow(10, d + 2), 2.5 * Math.pow(10, d + 2), 5 * Math.pow(10, d + 2),
  ];

  const ticksCount = axis.tickCount ?? 8;

  function minExt(source: number[]): number {
    let result = null;
    let current = Infinity;

    for (let item of source) {
      let value = Math.abs(diff / item - ticksCount);
      if (value < current) { current = value; result = item; }
    }
    return result;
  }

  let step = minExt(steps);
  if (axis.tickCount !== null) {
    diff = diff + diff / ticksCount;
    const filteredSteps = steps.filter(x => diff / x - ticksCount <= 0);
    step = minExt(filteredSteps);
  }

  if (axis.min === null && axis.max === null) {
    actualMin = Math.floor(min / step) * step;
    actualStep = step;
    if (axis.tickCount === null) {
      actualMax = (Math.floor(max / step) + 1) * step;
    } else {
      actualMax = actualMin + actualStep * axis.tickCount;
    }
  } else if (axis.min !== null && axis.max === null) {
    actualMin = axis.min;
    actualStep = step;
    if (axis.tickCount === null) {
      actualMax = actualMin + (Math.floor((max - actualMin) / step) + 1) * step;
    } else {
      actualMax = actualMin + actualStep * axis.tickCount;
    }
  } else if (axis.max !== null && axis.min === null) {
    actualMax = axis.max;
    actualStep = step;
    if (axis.tickCount === null) {
      actualMin = actualMax - (Math.floor(Math.abs(actualMin - axis.max) / step) + 1) * step;
    } else {
      actualMax = actualMax - actualStep * axis.tickCount;
    }
  } else {
    actualMax = axis.max;
    actualMin = axis.min;
    if (axis.tickCount === null) {
      actualStep = step;
    } else {
      actualStep = (axis.max - axis.min) / axis.tickCount;
    }
  }

  const ticks = Array.from({length: Math.floor((actualMax - actualMin) / actualStep) + 1}, (_, i) => {
    return ((actualMin + i * actualStep));
  });
  return {domain: [actualMin, actualMax], ticks};
}
