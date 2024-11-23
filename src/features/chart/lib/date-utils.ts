export const dateKeyGetters: Record<ChartDateStep, (date: Date) => number> = {
  'day': dayStep,
  'month': monthStep,
  'year': yearStep,
};

export const dateFormatters: Record<ChartDateStep, (date: Date) => string> = {
  'day': dayStepFormatter,
  'month': monthStepFormatter,
  'year': yearStepFormatter,
}

function dayStep(date: Date): number {
  return date.getFullYear() * 10000 + date.getMonth() * 100 + date.getDate();
}
function monthStep(date: Date): number {
  return date.getFullYear() * 12 + date.getMonth();
}
function yearStep(date: Date): number {
  return date.getFullYear();
}

/** Сокращения месяцев на русском языке. */
const ruMonths = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

function dayStepFormatter(date: Date): string {
  return date.toLocaleDateString();
}
function monthStepFormatter(date: Date): string {
  return ruMonths[date.getMonth()] + ' ' + date.getFullYear();
}
function yearStepFormatter(date: Date): string {
  return date.getFullYear().toString();
}
